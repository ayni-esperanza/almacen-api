# ====================================
# Stage 1: Dependencies
# ====================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias (incluyendo dev para el build)
RUN npm ci

# ====================================
# Stage 2: Production Dependencies
# ====================================
FROM node:20-alpine AS prod-deps

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar SOLO dependencias de producción
RUN npm ci --omit=dev && npm cache clean --force

# Generar Prisma Client para producción
RUN npx prisma generate

# ====================================
# Stage 3: Builder
# ====================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias del stage anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Build de NestJS (TypeScript)
RUN npm run build

# ====================================
# Stage 4: Runner (Producción)
# ====================================
FROM node:20-alpine AS runner

WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copiar node_modules de producción desde prod-deps
COPY --from=prod-deps /app/node_modules ./node_modules

# Copiar archivos compilados desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Cambiar ownership a usuario no-root
RUN chown -R nestjs:nodejs /app

# Usar usuario no-root
USER nestjs

# Exponer puerto de la API
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Health check - Usa endpoint dedicado /health
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicio: ejecutar migraciones y luego iniciar el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
