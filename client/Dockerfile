# Use Node.js 20 (required for Vite compatibility)
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose Vite's default port
EXPOSE 5173

# Start Vite dev server with --host to allow network access from host
CMD [ "npm", "run", "dev", "--", "--host" ]
