# Use official Nginx image as the base image
FROM nginx:alpine


WORKDIR /usr/src/app

# Copy the Nginx configuration from host to container
RUN ls -la ./
RUN find / -type f -name "nginx.conf" -print
RUN ls -la /usr/lib/nginx
RUN ls -la /etc/nginx
RUN ls -la /usr/share/nginx
# COPY /usr/lib/nginx/nginx.conf /etc/nginx/nginx.conf


