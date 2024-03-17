# Use official Node.js LTS version as base image
FROM node:lts as build

# Set working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Vite.js app
RUN npm run build 
RUN ls -la /usr/src/app/dist

# Stage 2 - the production environment
FROM nginx:alpine

# Assuming your Docker context is set correctly and includes both client and server directories:
RUN find / -type d -name "client" -print
COPY --from=build /usr/src/app/dist /usr/share/nginx/html/client
COPY --from=build /usr/src/app//dist /usr/share/nginx/html/server

RUN ls -la
RUN find / -type d -name "client" -print
RUN find / -type f -name "package.json" -print

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
