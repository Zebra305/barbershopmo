# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first for better caching
COPY package*.json ./

# Install all dependencies (production and dev) required for the build step
RUN npm ci

# Copy all project files
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on (5000)
EXPOSE 5000

# Start the application
CMD ["npm", "start"]