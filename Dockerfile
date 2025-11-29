# Use Node 20
FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package.json backend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy backend source code
COPY backend/ ./

# Build application
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main.js"]
