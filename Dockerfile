#---------------------------------------------------
# Stage 1: The "Builder" Stage 
#---------------------------------------------------
# Use a full Node.js image to have access to build tools
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies, including dev dependencies needed for the build
RUN npm ci

# Copy the rest of your application source code
COPY . .

# RUN Prisma
RUN npx prisma generate

# Run your build command to generate the /dist folder
RUN npm run build

# Show the Directories
RUN ls ./src/generated/prisma

# Copy the generated Prisma client to the dist folder
RUN cp ./src/generated/prisma/*.node ./dist/generated/prisma/

#---------------------------------------------------
# Stage 2: The "Final" Stage
#---------------------------------------------------
# Start from a lightweight base image for the final container
FROM node:22-alpine

WORKDIR /app

# Copy only the package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Install Redis server
RUN apk add --no-cache redis

# Copy the built application from the "builder" stage
# This is the key step!
COPY --from=builder /app/dist ./dist
# Copy all your scripts into the container
# COPY entrypoint.sh migrate.sh start-app.sh ./
# # Make all scripts executable
# RUN chmod +x entrypoint.sh migrate.sh start-app.sh

EXPOSE 3000

# Command to run the compiled application from the dist folder
# Your actual start command might be different (e.g., 'node dist/server.js')
# ENTRYPOINT ["/app/entrypoint.sh"]

# CMD ["node", "dist/server.js"]

CMD ["/bin/sh", "-c", "redis-server --daemonize yes && npm start"]