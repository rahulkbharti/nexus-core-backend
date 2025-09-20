#!/bin/sh

# Run the migration script first
sh /app/migrate.sh

# After migrations are done, run the start-app script
# Using 'exec' on the last command is a best practice.
# It replaces the script process with the app process.

exec sh /app/start-app.sh