# ====================================
# Stage 1: Dependencies
# ====================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# ====================================
# Stage 2: Production Dependencies
# ====================================
FROM node:20-alpine AS prod-deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npm cache clean --force
RUN npx prisma generate

# ====================================
# Stage 3: Builder
# ====================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ====================================
# Stage 4: Runner (Producción)
# ====================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

RUN chown -R nestjs:nodejs /app

USER nestjs

# 1. Exponemos el 3003 (informativo para Docker)
EXPOSE 3003

# 2. Variable por defecto alineada
ENV NODE_ENV=production
ENV PORT=3003

# 3. El Healthcheck ahora apunta al 3003
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3003/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]