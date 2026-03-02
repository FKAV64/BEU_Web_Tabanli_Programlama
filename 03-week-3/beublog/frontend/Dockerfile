# Stage 1: Build the React application using Vite
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
# Using legacy-peer-deps to avoid the ESLint conflict we saw earlier
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve the built app using Nginx
FROM nginx:alpine
# Copy our custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy the compiled React build files from Stage 1 into Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]