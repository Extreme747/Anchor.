# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package definitions
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./

# Install dependencies
RUN npm ci

# Copy source assets & code
COPY src ./src/
COPY public ./public/

# Build static client
RUN npm run build

# Nginx production serve stage
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
