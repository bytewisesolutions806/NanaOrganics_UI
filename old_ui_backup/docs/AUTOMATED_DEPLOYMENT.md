# Automated storefront deployment

Run the environment-aware deployment command from the frontend repository root
on EC2:

```bash
cd /opt/nanaorganics-ui
bash deploy.sh production
```

The supported profiles are `dev`, `staging`, and `production`. They select
`.env.dev`, `.env.staging`, and `.env.production` respectively. All environment
files are ignored by Git.

The first time, pull the commit that introduces the command:

```bash
cd /opt/nanaorganics-ui
git pull --ff-only origin main
bash deploy.sh production
```

The command refuses dirty or untracked files and non-fast-forward updates, fetches
the latest `origin/main`, builds the new image without interrupting the current
storefront, replaces the container, and waits for its health check. If health
validation fails, it restores the previously running image automatically.

If several environments share one EC2 host, set a distinct `STOREFRONT_PORT`
inside each environment file. The scripts already isolate Compose projects,
container names, and image repositories by environment.
