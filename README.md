# WhatsApp Clone - Real-time Chat & Video Call Application

A modern, full-featured chat application built with Node.js, Express, Socket.IO, WebRTC, and Prisma. Features include real-time messaging, video calls, user authentication, and a WhatsApp-inspired interface.

## Features

✨ **User Authentication**
- Secure signup and login with bcrypt password hashing
- Session-based authentication
- Protected routes

💬 **Real-time Messaging**
- Instant message delivery using Socket.IO
- Persistent chat history stored in database
- Message read status
- Typing indicators
- Online/offline status

📹 **Video Calling**
- One-to-one video calls using WebRTC
- Audio mute/unmute
- Video on/off toggle
- Incoming call notifications

👥 **User Management**
- Search users by name or email
- Create new conversations
- View all conversations with last message preview

🎨 **Modern UI**
- WhatsApp-inspired design
- Responsive layout (mobile & desktop)
- Clean and intuitive interface
- Tailwind CSS styling

## Tech Stack

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Database**: PostgreSQL with Prisma ORM
- **Video/Audio**: WebRTC
- **Authentication**: express-session, bcrypt
- **Frontend**: EJS templates, Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL database
- pnpm (or npm/yarn)

## Installation & Setup

1. **Clone the repository**
   ```bash
   cd webrtc-video-call
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Database**
   
   Make sure your PostgreSQL database is running and update the `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   SESSION_SECRET="your-secret-key-change-this-in-production"
   PORT=3000
   NODE_ENV=development
   ```

4. **Initialize Prisma**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # (Optional) Open Prisma Studio to view your database
   npx prisma studio
   ```

5. **Start the application**
   ```bash
   pnpm start
   # or for development with auto-reload
   pnpm dev
   ```

6. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

### Getting Started

1. **Sign Up**: Create a new account with your name, email, and password
2. **Login**: Sign in with your credentials
3. **Search Users**: Click the search icon in the header to find other users
4. **Start Chatting**: Click on a user to start a new conversation
5. **Send Messages**: Type your message and press enter or click send
6. **Video Call**: Click the video icon in the chat header to start a call

### Database Schema

The application uses the following database models:

- **User**: Stores user information (email, password, name)
- **Conversation**: Represents a chat between users
- **ConversationParticipant**: Links users to conversations
- **Message**: Stores individual messages

## Project Structure

```
webrtc-video-call/
├── app.js                 # Main server file
├── package.json
├── .env                   # Environment variables
├── prisma/
│   └── schema.prisma     # Database schema
├── views/
│   ├── login.ejs         # Login page
│   ├── signup.ejs        # Signup page
│   ├── dashboard.ejs     # Main chat interface
│   ├── index.ejs         # Landing page
│   └── chat.ejs          # Old chat page (can be removed)
└── public/
    └── css/
        └── style.css     # Custom styles
```

## Key Features Explained

### Authentication System
- Uses bcrypt for secure password hashing
- express-session for maintaining user sessions
- Middleware to protect routes requiring authentication

### Real-time Communication
- Socket.IO for instant message delivery
- User authentication on socket connection
- Events for typing indicators, online status, and message delivery

### Video Calling
- WebRTC peer-to-peer connections
- STUN servers for NAT traversal
- Signaling through Socket.IO
- Media controls (mute, video toggle)

### Database Integration
- Prisma ORM for type-safe database queries
- Automatic relationship management
- Migration system for schema changes

## API Endpoints

### Authentication
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /signup` - Signup page
- `POST /signup` - Create new user
- `GET /logout` - Logout user

### Dashboard & Chat
- `GET /dashboard` - Main chat interface (protected)
- `GET /api/conversations/:id/messages` - Get messages for a conversation
- `GET /api/users/search` - Search for users
- `POST /api/conversations` - Create or get conversation with user

## Socket.IO Events

### Client → Server
- `authenticate` - Authenticate socket connection
- `sendMessage` - Send a message
- `markAsRead` - Mark messages as read
- `typing` - Send typing indicator
- `startVideoCall` - Initiate video call
- `signalingMessage` - WebRTC signaling
- `acceptCall` - Accept incoming call
- `rejectCall` - Reject incoming call

### Server → Client
- `receiveMessage` - Receive new message
- `messagesRead` - Messages were read by recipient
- `userTyping` - User is typing
- `incomingCall` - Incoming video call
- `callAccepted` - Call was accepted
- `callRejected` - Call was rejected
- `signalingMessage` - WebRTC signaling data
- `userOnline` - User came online
- `userOffline` - User went offline

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt with salt rounds
2. **Session Management**: Secure session cookies with configurable options
3. **SQL Injection**: Prisma provides protection against SQL injection
4. **XSS Protection**: User input is escaped in templates

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production` in `.env`
2. Use a strong, random `SESSION_SECRET`
3. Enable HTTPS and set `cookie.secure=true`
4. Configure proper STUN/TURN servers for WebRTC
5. Set up database backups
6. Use environment-specific configuration

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Run `npx prisma generate` to regenerate Prisma Client

### Video Call Not Working
- Ensure browser has camera/microphone permissions
- Check if STUN servers are accessible
- For production, consider using TURN servers

### Socket Connection Issues
- Check if port 3000 is available
- Verify Socket.IO client version matches server version
- Check browser console for errors

## Future Enhancements

- [ ] Group chats
- [ ] File/image sharing
- [ ] Message reactions
- [ ] Voice messages
- [ ] End-to-end encryption
- [ ] Push notifications
- [ ] Message search
- [ ] User profiles and avatars
- [ ] Last seen status
- [ ] Message deletion

## License

MIT License - feel free to use this project for learning or production purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please open an issue on the repository.

---

**Note**: This is a learning project. For production use, additional security measures, error handling, and testing should be implemented.
