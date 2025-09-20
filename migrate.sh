#!/bin/sh
echo "🏃‍♂️ Running database migrations..."
npx prisma generate
# Add your actual migration command here (e.g., npx prisma migrate deploy)
echo "✅ Migrations complete."