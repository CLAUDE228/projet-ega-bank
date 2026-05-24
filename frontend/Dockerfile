FROM node:20 AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source and keep dev server
COPY . .

EXPOSE 4200

# Run Angular dev server listening on all interfaces
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200"]
