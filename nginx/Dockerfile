# Stage 1: Build the React application
FROM node:lts as build

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code and build the application
COPY . .
RUN npm run build 

# Stage 2: Setup Nginx to serve the React application
FROM nginx:alpine

# Copy built assets from the build stage to Nginx's serve directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Optionally, copy your custom Nginx configuration if you have one
# Ensure you have an nginx.conf in your project's nginx directory
# COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD [\"nginx\", \"-g\", \"daemon off;\"]