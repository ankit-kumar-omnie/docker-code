# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /var/www

# Install dependencies
COPY package*.json ./
RUN npm install

# Install PM2 and ts-node globally
RUN npm install -g pm2 ts-node typescript

# Copy the entire project
COPY . .

# Expose app port
EXPOSE 3000

# Start app in PM2 with watch mode
CMD ["pm2-runtime", "ecosystem.config.js"]
