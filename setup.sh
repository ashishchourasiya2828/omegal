#!/bin/bash

# WhatsApp Clone - Quick Setup Script

echo "🚀 Starting WhatsApp Clone Setup..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your database credentials:"
    echo ""
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/database_name\""
    echo "SESSION_SECRET=\"your-secret-key-change-this-in-production\""
    echo "PORT=3000"
    echo "NODE_ENV=development"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init
echo ""

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "To start the application, run:"
    echo "  pnpm start"
    echo ""
    echo "Then open your browser to:"
    echo "  http://localhost:3000"
    echo ""
    echo "Optional: To view your database in Prisma Studio, run:"
    echo "  npx prisma studio"
else
    echo "❌ Database migration failed!"
    echo "Please check your DATABASE_URL in .env file"
    echo "and ensure PostgreSQL is running"
    exit 1
fi
