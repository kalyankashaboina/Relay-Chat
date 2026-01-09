# ------------ STAGE 1: Build the React/Vite app ------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package files first (better layer caching)
COPY package*.json ./

# Install deps exactly as in package-lock.json
RUN npm ci

# Copy the rest of the project
COPY . .

# Build using your prod Vite config
RUN npm run build
# This will use: vite build --config vite.prod.config.ts
# Output: /app/dist


# ------------ STAGE 2: Serve with Nginx ------------
FROM nginx:1.27-alpine

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: custom nginx config for React Router SPA
# Uncomment the two lines below if you add nginx.conf as shown later
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
