# Use Node 20
FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies)
RUN npm install

# Verify TypeScript is installed
RUN ls -la node_modules/.bin/ && npm list typescript @nestjs/cli

# Copy source code
COPY . .

# Build application using npm script
RUN npm run build || (echo "Build failed, trying alternative..." && npx -p typescript -p @nestjs/cli nest build)

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main.js"]
