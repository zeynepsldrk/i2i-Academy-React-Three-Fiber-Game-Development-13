# Stage 1: Build React Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors and lockfile
COPY package*.json ./

# Install packages
RUN npm ci

# Copy project files
COPY . .

# Build production assets
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration if needed, or use default Nginx location
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
