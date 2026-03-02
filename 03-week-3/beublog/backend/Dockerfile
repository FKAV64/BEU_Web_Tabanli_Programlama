# Use the official Node.js image as our base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Create the uploads directory so it exists
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 5000

# The command to start our server
CMD ["npm", "start"]