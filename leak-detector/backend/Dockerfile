# Use official Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy remaining code
COPY . .

# Expose backend port
EXPOSE 3001

# Start server
CMD ["npm", "run","dev"]