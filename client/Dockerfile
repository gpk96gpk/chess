# Use official Node.js LTS version as base image
FROM node:lts as build

RUN ls -la
RUN ls -la /home
RUN ls -la /home/ubuntu
RUN find / -type d -name "client" -print
RUN find / -type f -name "package.json" -print
# Set working directory in the container
WORKDIR /home/ubuntu/chess

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the Vite.js app
RUN npm run build 

# Stage 2 - the production environment
FROM nginx:alpine

# Assuming your Docker context is set correctly and includes both client and server directories:
RUN find / -type d -name "client" -print
COPY --from=build /home/ubuntu/chess/dist /usr/share/nginx/html/client
COPY --from=build /home/ubuntu/chess//dist /usr/share/nginx/html/server

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
