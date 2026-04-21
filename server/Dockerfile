# Use official Node.js 20 image (required for modern tools/compatibility)
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the server using nodemon for hot-reloading
CMD [ "npm", "run", "dev" ]
