# Use Node 20
FROM node:20-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application using TypeScript compiler
RUN npx tsc -p tsconfig.json

# Expose port
EXPOSE 3001

# Start application
CMD ["node", "dist/main.js"]
