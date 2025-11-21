# Quick Setup Guide

## Your database is already configured! ✅

Your `.env` file shows:
```
DATABASE_URL="postgresql://postgres:Apitaji1415@localhost:5432/postgres"
```

## Next Steps:

### 1. Setup Database Schema

Run one of these commands:

**Option A: Using the setup script (recommended)**
```bash
./setup.sh
```

**Option B: Using npm/pnpm commands**
```bash
pnpm run setup
```

**Option C: Manual setup**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will:
- Generate the Prisma Client
- Create the database tables (users, conversations, messages, etc.)
- Apply all migrations

### 2. Start the Application

```bash
pnpm start
```

### 3. Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## What to Expect:

1. **First Visit**: You'll be redirected to the login page
2. **Sign Up**: Click "Sign Up" to create your first account
3. **Login**: After signing up, you'll be automatically logged in
4. **Dashboard**: You'll see the WhatsApp-like interface with:
   - Left sidebar: Your conversations list (empty at first)
   - Right side: Empty state asking you to select a conversation
5. **Search Users**: Click the search icon (🔍) in the top left to find other users
6. **Start Chatting**: Click on a user from search results to start a conversation
7. **Video Call**: Once in a conversation, click the video icon to start a call

## Testing with Multiple Users:

To test the full functionality, you'll need to:

1. Create at least 2 user accounts
2. You can do this by:
   - Opening the app in different browsers (Chrome, Firefox, etc.)
   - Using incognito/private windows
   - Using different browser profiles

## Optional: View Database in Prisma Studio

To see your data in a nice GUI:

```bash
pnpm run studio
```

This will open Prisma Studio in your browser where you can view and edit database records.

## Database Tables Created:

After running migrations, you'll have these tables:

- **users**: Stores user accounts (id, email, password, name)
- **conversations**: Stores chat conversations
- **conversation_participants**: Links users to conversations
- **messages**: Stores all chat messages

## Troubleshooting:

### If migrations fail:
1. Make sure PostgreSQL is running
2. Verify your database credentials in `.env`
3. Check if the database exists
4. Try connecting to the database manually:
   ```bash
   psql -U postgres -h localhost -d postgres
   ```

### If you need to reset the database:
```bash
npx prisma migrate reset
```
⚠️ Warning: This will delete all data!

### If you need to regenerate Prisma Client:
```bash
npx prisma generate
```

## Features to Test:

Once set up, test these features:

✅ User Registration & Login
✅ Real-time Messaging
✅ Typing Indicators
✅ Online/Offline Status
✅ Message History
✅ User Search
✅ Video Calling (needs 2 users)
✅ Audio Mute/Unmute
✅ Video On/Off

## Need Help?

Check the main README.md file for detailed documentation.

---

**Ready to go?** Run `pnpm run setup` and then `pnpm start`! 🚀
