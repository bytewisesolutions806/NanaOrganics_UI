#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_ROOT"

DEPLOY_ENV="${1:-production}"
case "$DEPLOY_ENV" in
    dev|staging|production) ;;
    *)
        echo "Usage: bash deploy.sh {dev|staging|production}" >&2
        exit 2
        ;;
esac

BRANCH="${DEPLOY_BRANCH:-main}"
ENV_FILE="${ENV_FILE:-.env.${DEPLOY_ENV}}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.production.yml}"
export ENV_FILE COMPOSE_FILE

if [[ "$DEPLOY_ENV" == "production" ]]; then
    export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-nanaorganics-ui}"
    export FRONTEND_IMAGE_REPOSITORY="${FRONTEND_IMAGE_REPOSITORY:-nana-ui}"
    export STOREFRONT_CONTAINER_NAME="${STOREFRONT_CONTAINER_NAME:-nana-ui}"
else
    export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-nanaorganics-ui-${DEPLOY_ENV}}"
    export FRONTEND_IMAGE_REPOSITORY="${FRONTEND_IMAGE_REPOSITORY:-nana-ui-${DEPLOY_ENV}}"
    export STOREFRONT_CONTAINER_NAME="${STOREFRONT_CONTAINER_NAME:-nana-ui-${DEPLOY_ENV}}"
fi

compose() {
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

fail() {
    echo "Deployment failed: $*" >&2
    exit 1
}

for command_name in git docker; do
    command -v "$command_name" >/dev/null 2>&1 || fail "missing command: $command_name"
done
docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required"

[[ -f "$ENV_FILE" ]] || fail "missing $ENV_FILE"

env_value() {
    local key="$1" line value
    line="$(grep -E "^[[:space:]]*${key}=" "$ENV_FILE" | tail -n 1 || true)"
    [[ -n "$line" ]] || return 0
    value="${line#*=}"
    value="${value%$'\r'}"
    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
        value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
        value="${value:1:${#value}-2}"
    fi
    printf '%s' "$value"
}

is_placeholder() {
    local value="${1,,}"
    [[ -z "$value" ||
       "$value" == *"replace-with"* ||
       "$value" == *"example-secret"* ||
       "$value" == *"change-me"* ||
       "$value" == *"changeme"* ||
       "$value" == *"example.com"* ||
       "$value" == *"..."* ]]
}

INVALID_ENV_KEYS=()
for key in \
    NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_VENDURE_SHOP_API_URL \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY; do
    value="$(env_value "$key")"
    if is_placeholder "$value"; then
        INVALID_ENV_KEYS+=("$key")
    fi
done

if (( ${#INVALID_ENV_KEYS[@]} > 0 )); then
    printf 'Deployment failed: configure these required variables in %s:\n' "$ENV_FILE" >&2
    printf '  - %s\n' "${INVALID_ENV_KEYS[@]}" | sort -u >&2
    exit 1
fi

if command -v flock >/dev/null 2>&1; then
    exec 9>"$REPO_ROOT/.git/deploy-${DEPLOY_ENV}.lock"
    flock -n 9 || fail "another $DEPLOY_ENV deployment is already running"
fi

if [[ -n "$(git status --porcelain)" ]]; then
    fail "repository has local or untracked changes; commit or preserve them before deploying"
fi

CURRENT_BRANCH="$(git symbolic-ref --quiet --short HEAD || true)"
[[ "$CURRENT_BRANCH" == "$BRANCH" ]] || fail "expected branch $BRANCH, found ${CURRENT_BRANCH:-detached HEAD}"

echo "Fetching origin/$BRANCH..."
START_COMMIT="$(git rev-parse HEAD)"
git fetch --prune origin "$BRANCH"
git merge --ff-only "origin/$BRANCH"

if [[ "$(git rev-parse HEAD)" != "$START_COMMIT" && "${DEPLOY_REEXEC:-0}" != "1" ]]; then
    echo "Repository updated; restarting with the latest deploy.sh..."
    export DEPLOY_REEXEC=1
    exec bash "$REPO_ROOT/deploy.sh" "$DEPLOY_ENV"
fi

RELEASE="$(git rev-parse --short=12 HEAD)"
export IMAGE_TAG="$RELEASE"
echo "Deploying frontend $RELEASE to $DEPLOY_ENV using $ENV_FILE"

compose config --quiet

PREVIOUS_CONTAINER="$(compose ps -q storefront 2>/dev/null || true)"
PREVIOUS_IMAGE_ID=""
if [[ -n "$PREVIOUS_CONTAINER" ]]; then
    PREVIOUS_IMAGE_ID="$(docker inspect --format '{{.Image}}' "$PREVIOUS_CONTAINER")"
fi

# Build without interrupting the currently running storefront.
compose build --pull storefront

ROLLBACK_TAG="before-${RELEASE}"
if [[ -n "$PREVIOUS_IMAGE_ID" ]]; then
    docker image tag "$PREVIOUS_IMAGE_ID" \
        "${FRONTEND_IMAGE_REPOSITORY}:${ROLLBACK_TAG}"
fi

compose up -d --no-build --remove-orphans --force-recreate storefront

wait_for_healthy() {
    local container_id status
    for ((attempt = 1; attempt <= 60; attempt++)); do
        container_id="$(compose ps -q storefront 2>/dev/null || true)"
        if [[ -n "$container_id" ]]; then
            status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container_id" 2>/dev/null || true)"
            if [[ "$status" == "healthy" ]]; then
                return 0
            fi
            if [[ "$status" == "unhealthy" || "$status" == "exited" || "$status" == "dead" ]]; then
                echo "storefront entered state: $status" >&2
                return 1
            fi
        fi
        sleep 5
    done
    return 1
}

cleanup_old_release_images() {
    local repository="$1"
    local current_ref="${repository}:${RELEASE}"
    local rollback_ref="${repository}:${ROLLBACK_TAG}"
    local image_ref

    echo "Removing old ${repository} release images..."
    while IFS= read -r image_ref; do
        [[ -n "$image_ref" ]] || continue
        if [[ "$image_ref" == "$current_ref" || "$image_ref" == "$rollback_ref" ]]; then
            continue
        fi

        # A reference still used by another container is deliberately retained.
        docker image rm "$image_ref" >/dev/null 2>&1 || true
    done < <(docker image ls "$repository" --format '{{.Repository}}:{{.Tag}}')

}

if ! wait_for_healthy; then
    compose logs --tail=200 storefront >&2 || true
    if [[ -n "$PREVIOUS_IMAGE_ID" ]]; then
        echo "New storefront failed health checks; restoring the previous image..." >&2
        export IMAGE_TAG="$ROLLBACK_TAG"
        compose up -d --no-build --force-recreate storefront
        wait_for_healthy || fail "both the new and rollback storefront failed health checks"
        fail "new release failed; previous storefront image was restored"
    fi
    fail "storefront did not become healthy and no previous image was available"
fi

cleanup_old_release_images "$FRONTEND_IMAGE_REPOSITORY"
compose ps
echo "Frontend $RELEASE deployed successfully to $DEPLOY_ENV."
