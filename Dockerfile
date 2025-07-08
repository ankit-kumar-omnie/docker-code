# Use official Node.js base image
FROM node:20

# Set working directory
WORKDIR /var/www

# Copy package files and install dependencies first (layer caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# ✅ Copy .env for ConfigModule.forRoot to work inside container
COPY .env .env

# Build the app
RUN npm run build

# Expose app port
EXPOSE 3000

# Run in development mode (use start:prod for production builds)
CMD ["npm", "run", "start:dev"]
