FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the backend port
EXPOSE 5000

# Start the server with node (not nodemon for production)
CMD ["node", "server.js"]