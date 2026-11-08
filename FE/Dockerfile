# ==============================================================================
# Multi-stage Dockerfile cho Frontend Next.js 16 (Node.js 22-Alpine) - QLSV
# Tối ưu hóa kích thước image và bảo mật với Next.js Standalone Output
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Cài đặt dependencies
# ------------------------------------------------------------------------------
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package definitions để tận dụng Docker layer cache
COPY package.json package-lock.json* ./
RUN npm ci

# ------------------------------------------------------------------------------
# Stage 2: Build ứng dụng Next.js
# ------------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Tắt telemetry để tăng tốc build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Chạy build tạo output standalone
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Runtime image tối giản chỉ chứa Node runtime (~150MB)
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Tạo non-root user 'nextjs' để đảm bảo an toàn bảo mật container
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy thư mục static và public
COPY --from=builder /app/public ./public

# Tự động cấp quyền thư mục cache cho user nextjs
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build từ builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Khởi chạy server standalone của Next.js
CMD ["node", "server.js"]

