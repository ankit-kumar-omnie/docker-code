# Use official Node.js base image
FROM node:20

# Set working directory
WORKDIR /var/www

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy environment file
COPY .env .env

# Expose app port
EXPOSE 3000

# Run in development mode
CMD ["npm", "run", "start:dev"]
