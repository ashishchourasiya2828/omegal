#!/bin/bash
set -e

echo "🚀 WhatsApp Video Call - Docker + Prisma 7 Setup"
echo "=================================================="

# Navigate to project directory
cd "$(dirname "$0")"

# Stop any local PostgreSQL that might conflict
echo ""
echo "1️⃣ Checking for conflicting PostgreSQL instances..."
if sudo systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "⚠️  Local PostgreSQL is running on port 5432"
    read -p "Stop local PostgreSQL? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo systemctl stop postgresql
        echo "✅ Local PostgreSQL stopped"
    fi
fi

# Start Docker containers
echo ""
echo "2️⃣ Starting PostgreSQL Docker container..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo ""
echo "3️⃣ Waiting for PostgreSQL to initialize..."
echo "   This may take 10-15 seconds..."
sleep 5

MAX_RETRIES=30
RETRY_COUNT=0

until docker exec postgres_local pg_isready -U postgres > /dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ PostgreSQL failed to start after ${MAX_RETRIES} attempts"
    echo "   Check logs: docker logs postgres_local"
    exit 1
  fi
  echo "   ⏳ Waiting... (attempt ${RETRY_COUNT}/${MAX_RETRIES})"
  sleep 1
done

echo "✅ PostgreSQL is ready!"

# Verify database exists
echo ""
echo "4️⃣ Verifying database..."
docker exec postgres_local psql -U postgres -lqt | cut -d \| -f 1 | grep -qw chat_app
if [ $? -eq 0 ]; then
    echo "✅ Database 'chat_app' exists"
else
    echo "⚠️  Database 'chat_app' not found, creating..."
    docker exec postgres_local psql -U postgres -c "CREATE DATABASE chat_app;"
    echo "✅ Database 'chat_app' created"
fi

# Generate Prisma Client
echo ""
echo "5️⃣ Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"

# Run migrations
echo ""
echo "6️⃣ Running database migrations..."
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    echo "   Existing migrations found, applying..."
    npx prisma migrate deploy
else
    echo "   Creating initial migration..."
    npx prisma migrate dev --name init --skip-generate
fi
echo "✅ Migrations complete"

# Verify tables were created
echo ""
echo "7️⃣ Verifying database tables..."
TABLES=$(docker exec postgres_local psql -U postgres -d chat_app -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
echo "   Found $TABLES tables"

if [ "$TABLES" -ge 4 ]; then
    echo "✅ All tables created successfully"
else
    echo "⚠️  Expected at least 4 tables, found $TABLES"
fi

# Check if node_modules exists
echo ""
echo "8️⃣ Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "=================================================="
echo "✅ Setup Complete!"
echo "=================================================="
echo ""
echo "📊 Database Status:"
echo "   Container: postgres_local"
echo "   Port: 5432"
echo "   Database: chat_app"
echo "   User: postgres"
echo ""
echo "🎯 Next Steps:"
echo ""
echo "   1. Start the server:"
echo "      pnpm start"
echo ""
echo "   2. Open browser:"
echo "      http://localhost:3000"
echo ""
echo "   3. Test video call:"
echo "      - Open 2 incognito windows"
echo "      - Register as User A and User B"
echo "      - Start a video call"
echo ""
echo "📚 Useful Commands:"
echo "   - View DB in GUI: npx prisma studio"
echo "   - Check logs: docker logs postgres_local"
echo "   - Stop DB: docker-compose down"
echo "   - Restart DB: docker-compose restart"
echo ""
echo "🐛 Troubleshooting:"
echo "   - See DOCKER_SETUP.md for detailed guide"
echo ""
