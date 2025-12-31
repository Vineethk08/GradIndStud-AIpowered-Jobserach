# Stage 1: Build the React app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Accept the API key as a build argument
ARG GEMINI_API_KEY

# Write the API key to .env.local before building
RUN echo "GEMINI_API_KEY=${GEMINI_API_KEY}" > .env.local

# Build the React app for production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built files from builder stage to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8080 (Cloud Run uses this port)
EXPOSE 8080

# Run nginx in foreground (required for Docker)
CMD ["nginx", "-g", "daemon off;"]

