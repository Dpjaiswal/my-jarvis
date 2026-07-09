FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY apps/web/package.json ./
RUN npm install

FROM base AS builder
WORKDIR /app
COPY apps/web ./
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
