# Use official Node.js LTS version as base image
FROM node:lts as build

# Set working directory in the container
WORKDIR /home/ubuntu/chess

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Stage 2 - the production environment
FROM node:lts

WORKDIR /home/ubuntu/chess

COPY --from=build /home/ubuntu/chess/dist/src /home/ubuntu/chess/dist/src
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Expose the port the app runs on
EXPOSE 3005

# Start the application
CMD ["npm", "start"]