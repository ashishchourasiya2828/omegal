# Docker + Prisma 7 Setup Guide

## ✅ Your Configuration is Already Correct!

Your project is properly configured for Prisma 7 with Docker PostgreSQL.

### Configuration Files Status:

1. **docker-compose.yml** ✅
   - PostgreSQL 16 container
   - Port: 5432
   - Database: chat_app
   - User: postgres / Password: postgres

2. **prisma.config.ts** ✅
   - Properly configured for Prisma 7
   - Uses `dotenv/config` for environment variables
   - Datasource URL from env

3. **.env** ✅
   - DATABASE_URL matches docker-compose settings
   - Session secret configured

4. **prisma/schema.prisma** ✅
   - Correct Prisma 7 format (no `url` in datasource)
   - All models defined properly

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start PostgreSQL Container
```bash
cd "/home/ashish-chourasiya/Desktop/webrtc-video call"

# Start Docker containers
docker-compose up -d

# Verify container is running
docker ps | grep postgres_local
```

**Expected Output**:
```
postgres_local   postgres:16   Up X seconds   0.0.0.0:5432->5432/tcp
```

### Step 2: Initialize Database
```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

**What this does**:
- Creates User, Conversation, ConversationParticipant, and Message tables
- Generates Prisma Client for database queries
- Sets up migration history

### Step 3: Start Application
```bash
# Start the Node.js server
pnpm start
```

**Server will start on**: http://localhost:3000

---

## 🔧 Useful Docker Commands

### Check Database Status
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check container logs
docker logs postgres_local

# Check database connectivity
docker exec -it postgres_local pg_isready
```

### Access PostgreSQL Shell
```bash
# Connect to PostgreSQL inside container
docker exec -it postgres_local psql -U postgres -d chat_app

# Once inside, you can run SQL:
\dt               # List tables
\d users          # Describe users table
SELECT * FROM users;
```

### Stop/Restart Database
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (CAUTION: deletes all data!)
docker-compose down -v

# Restart containers
docker-compose restart

# View container logs
docker-compose logs -f postgres
```

---

## 🗄️ Prisma 7 Commands

### Generate Client
```bash
npx prisma generate
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### View Database in GUI
```bash
npx prisma studio
```
Opens GUI at http://localhost:5555 to view/edit data

### Reset Database (Development Only!)
```bash
npx prisma migrate reset
```
⚠️ **WARNING**: This deletes ALL data!

### Check Migration Status
```bash
npx prisma migrate status
```

---

## 🐛 Troubleshooting

### Issue: "Can't reach database server"

**Solution 1**: Check if Docker container is running
```bash
docker ps
```
If not listed, start it:
```bash
docker-compose up -d
```

**Solution 2**: Wait for PostgreSQL to initialize
```bash
# Wait 10 seconds after starting container
sleep 10
npx prisma migrate dev
```

**Solution 3**: Check Docker logs
```bash
docker logs postgres_local
```

### Issue: "Migration failed"

**Solution**: Reset and recreate migrations
```bash
# Stop containers
docker-compose down -v

# Start fresh
docker-compose up -d
sleep 10

# Initialize database
npx prisma generate
npx prisma migrate dev --name init
```

### Issue: Port 5432 already in use

**Check if local PostgreSQL is running**:
```bash
sudo systemctl stop postgresql
# OR
sudo service postgresql stop
```

Then restart Docker containers:
```bash
docker-compose restart
```

---

## 📝 Complete Setup Script

Save this as `setup-docker.sh`:

```bash
#!/bin/bash
set -e

echo "🐳 Starting WhatsApp Video Call App with Docker..."

# Stop any local PostgreSQL
sudo systemctl stop postgresql 2>/dev/null || true

# Start Docker containers
echo "📦 Starting PostgreSQL container..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to initialize..."
sleep 10

# Check if database is ready
until docker exec postgres_local pg_isready; do
  echo "⏳ Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

echo "✅ Database setup complete!"

# Start application
echo "🚀 Starting application..."
pnpm start
```

**Make it executable**:
```bash
chmod +x setup-docker.sh
./setup-docker.sh
```

---

## 🎯 Testing Video Call

Once server is running:

1. **Open TWO incognito windows**
2. **Hard refresh BOTH** (Ctrl+Shift+R)
3. **Window 1**: Register as User A
4. **Window 2**: Register as User B
5. **Start call**: User A → video call button
6. **Accept call**: User B → Accept button
7. **Verify**: Both see each other's video

**Check console for**:
- 📞 [RECEIVER] Incoming call
- 📨 [RECEIVER] OFFER RECEIVED
- ✅ [RECEIVER] Offer stored
- 🟢 [RECEIVER] Processing offer
- 📥 Remote track received
- 🔗 Connection: connected

---

## 📊 Project Structure

```
webrtc-video call/
├── docker-compose.yml      # PostgreSQL container config
├── prisma.config.ts        # Prisma 7 configuration
├── .env                    # Environment variables
├── app.js                  # Express server
├── package.json            # Dependencies
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration history
├── views/
│   └── dashboard.ejs       # Video call UI
└── public/                 # Static files
```

---

## 🎉 Next Steps After Setup

1. ✅ Start Docker: `docker-compose up -d`
2. ✅ Initialize DB: `npx prisma generate && npx prisma migrate dev`
3. ✅ Start server: `pnpm start`
4. 🧪 Test: Open http://localhost:3000
5. 👥 Create two users and test video call!

---

## 📱 Production Deployment Notes

For production, update:

1. **docker-compose.yml**: Add environment-specific configs
2. **.env**: Use strong passwords, secure secrets
3. **app.js**: Set `NODE_ENV=production`
4. Consider using:
   - Docker Compose with networks
   - Environment-specific .env files
   - SSL/TLS certificates for HTTPS
   - TURN servers for WebRTC NAT traversal

---

**Your Prisma 7 + Docker setup is ready! Just run the 3 steps above to get started.** 🚀
