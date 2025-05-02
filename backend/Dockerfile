# Use an official Node.js runtime as a parent image (Choose LTS version, e.g., 20)
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for better caching
COPY package*.json ./

# Install app dependencies inside the container
RUN npm install --omit=dev
# Use --omit=dev to avoid installing devDependencies like nodemon in production

# Bundle app source code inside the Docker image
COPY . .

# Make port specified by environment variable (or 5000 default) available to the world outside this container
# Cloud Run automatically uses the PORT env var. Default is 8080 if not set.
# EXPOSE 5000 # This line is actually optional for Cloud Run

# Define the command to run your app using node
CMD [ "node", "server.js" ]