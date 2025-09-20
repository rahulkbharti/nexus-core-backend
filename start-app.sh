#!/bin/sh

echo "🚀 Starting the Redis server..."
# Start Redis server in the background
redis-server --daemonize yes

echo "🚀 Starting the application..."
# This command starts your app
exec npm start