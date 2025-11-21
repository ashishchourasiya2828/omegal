# ⚡ Quick Reference - Docker + Prisma 7

## 🚀 First Time Setup (Run Once)

```bash
# Automated setup (recommended)
./setup-docker.sh

# OR Manual setup
pnpm run docker:up
pnpm run prisma:generate
pnpm run prisma:migrate
pnpm start
```

---

## 📦 NPM Scripts (Updated!)

### Docker Commands
```bash
pnpm run docker:up       # Start PostgreSQL container
pnpm run docker:down     # Stop containers
pnpm run docker:restart  # Restart containers
pnpm run docker:logs     # View PostgreSQL logs
pnpm run docker:reset    # Reset database (deletes data!)
```

### Prisma Commands
```bash
pnpm run prisma:generate  # Generate Prisma Client
pnpm run prisma:migrate   # Create/apply migrations
pnpm run prisma:studio    # Open database GUI
pnpm run prisma:reset     # Reset migrations (deletes data!)
```

### Application Commands
```bash
pnpm start               # Start Node.js server
pnpm run dev             # Start in dev mode
```

---

## 🎯 Daily Development Workflow

### Starting Your Day
```bash
# 1. Start database
pnpm run docker:up

# 2. Start application
pnpm start

# 3. Open browser
# http://localhost:3000
```

### Ending Your Day
```bash
# Option 1: Keep database running (recommended)
# Just close terminal (Ctrl+C)

# Option 2: Stop database (saves resources)
pnpm run docker:down
```

---

## 🗄️ Database Management

### View Data in GUI
```bash
pnpm run prisma:studio
# Opens: http://localhost:5555
```

### Access PostgreSQL Shell
```bash
docker exec -it postgres_local psql -U postgres -d chat_app

# Inside psql:
\dt                  # List all tables
\d users            # Describe users table
\d messages         # Describe messages table
SELECT * FROM users;
\q                  # Quit
```

### Check Database Status
```bash
docker ps | grep postgres_local    # Check if running
docker logs postgres_local         # View logs
docker stats postgres_local        # View resource usage
```

---

## 🔧 Common Tasks

### After Changing Schema
```bash
# 1. Update prisma/schema.prisma
# 2. Create migration
pnpm run prisma:migrate

# 3. Prisma will ask for migration name, e.g.:
# "add_video_call_table"
```

### Database Got Corrupted?
```bash
# Nuclear option - fresh start
pnpm run docker:reset
sleep 10
pnpm run prisma:generate
pnpm run prisma:migrate
```

### Port 5432 Already in Use?
```bash
# Stop local PostgreSQL
sudo systemctl stop postgresql

# Restart Docker container
pnpm run docker:restart
```

### Connection Refused?
```bash
# Wait for PostgreSQL to start
sleep 10

# Check if ready
docker exec postgres_local pg_isready

# If still failing, check logs
pnpm run docker:logs
```

---

## 🐛 Troubleshooting Checklist

- [ ] Is Docker running? `docker ps`
- [ ] Is PostgreSQL container running? `docker ps | grep postgres_local`
- [ ] Is PostgreSQL ready? `docker exec postgres_local pg_isready`
- [ ] Are migrations applied? `pnpm run prisma:migrate`
- [ ] Is Prisma Client generated? `pnpm run prisma:generate`
- [ ] Is .env correct? Check DATABASE_URL matches docker-compose.yml

---

## 📊 File Structure

```
Prisma 7 Configuration:
✅ prisma.config.ts          # Prisma 7 config (uses .env)
✅ prisma/schema.prisma      # Database schema (NO url field)
✅ .env                      # Environment variables
✅ docker-compose.yml        # PostgreSQL container

Migration Files:
📁 prisma/migrations/        # Migration history
   └── [timestamp]_init/
       └── migration.sql
```

---

## 🎥 Video Call Testing

```bash
# 1. Start everything
./setup-docker.sh
pnpm start

# 2. Open 2 incognito windows
# Window 1: Register User A
# Window 2: Register User B

# 3. Start call
# User A → Video call button
# User B → Accept button

# 4. Check console logs for:
📞 [RECEIVER] Incoming call
📨 [RECEIVER] OFFER RECEIVED
✅ [RECEIVER] Offer stored
🟢 [RECEIVER] Processing offer
📥 Remote track received
🔗 Connection: connected
```

---

## 💡 Pro Tips

1. **Keep Docker running** during development to avoid startup delays
2. **Use Prisma Studio** for quick data inspection/editing
3. **Check logs** if something doesn't work: `pnpm run docker:logs`
4. **Commit migrations** to git for team collaboration
5. **Hard refresh browser** (Ctrl+Shift+R) after code changes

---

## 🔗 Quick Links

- Prisma Studio: http://localhost:5555
- Application: http://localhost:3000
- Documentation: `DOCKER_SETUP.md` (detailed guide)

---

**Need help?** Check `DOCKER_SETUP.md` for detailed troubleshooting!
