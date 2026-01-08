# ------------ Local Development Dockerfile ------------
FROM node:20-alpine

WORKDIR /app

# Copy only package files first (faster caching)
COPY package*.json ./

# Install dependencie
RUN npm install

# Copy all project files
COPY . .

# Expose the Vite port
EXPOSE 5173

# Run Vite dev server, allow external connections
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
