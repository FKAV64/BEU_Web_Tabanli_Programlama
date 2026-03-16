FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite default port is 5173
EXPOSE 5173

# Start Vite in host mode so it's accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]