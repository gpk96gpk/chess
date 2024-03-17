# Stage 1: Build the React application
FROM node:lts as build

# Set the working directory for the build stage
WORKDIR /home/ubuntu/chess

# List all files in the current directory (for debugging)
RUN ls -la /home
RUN ls -la /home/ubuntu
RUN ls -la /home/ubuntu/chess 

RUN find / -type d -name "client" -print

# Try to find package.json in the entire filesystem (for debugging)
RUN find / -type f -name "package.json" -print

# Copy package.json and package-lock.json
# COPY ./client/package*.json ./

# List files in /usr/src/app to verify copy (for debugging)
RUN ls -la

# Install project dependencies
RUN npm install

# Now copy the rest of your source code
COPY ./client ./

# List files to ensure source code was copied correctly (for debugging)
RUN ls -la

# Build the application to the 'dist' directory
RUN npm run build 

# List contents of the build directory (for debugging)
RUN ls -la dist

# Stage 2: Setup Nginx to serve the React application
FROM nginx:alpine

# Copy the built assets from the build stage to Nginx's serve directory
COPY --from=build /home/ubuntu/chess/dist /usr/share/nginx/html

# List files in Nginx serve directory to verify (for debugging)
RUN ls -la /usr/share/nginx/html

# Copy your custom Nginx configuration into the container
COPY /home/ubuntu/chess/nginx/nginx.conf /etc/nginx/nginx.conf 

# Expose port 80 to the host so that the service can be accessed
EXPOSE 80

# Use the "daemon off;" option to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
