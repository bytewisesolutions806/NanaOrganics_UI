# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_API_BASE_URL=""
ARG NEXT_PUBLIC_USE_MOCK_API="false"
ARG NEXT_PUBLIC_VENDURE_SHOP_API_URL
ARG NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN=""
ARG ALLOW_LOCAL_IMAGE_IP="false"

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_USE_MOCK_API=$NEXT_PUBLIC_USE_MOCK_API
ENV NEXT_PUBLIC_VENDURE_SHOP_API_URL=$NEXT_PUBLIC_VENDURE_SHOP_API_URL
ENV NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN=$NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN
ENV ALLOW_LOCAL_IMAGE_IP=$ALLOW_LOCAL_IMAGE_IP

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN test -n "$NEXT_PUBLIC_VENDURE_SHOP_API_URL" || \
    (echo "NEXT_PUBLIC_VENDURE_SHOP_API_URL build argument is required" && exit 1)
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3001

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3001/').then(response => { if (!response.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "server.js"]
