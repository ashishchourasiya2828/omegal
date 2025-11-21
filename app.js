const express = require("express");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");

const http = require("http");
const server = http.createServer(app);
const socketio = require("socket.io");
const io = socketio(server);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/login");
  }
};

const waitingUsers = [];
const userRooms = new Map(); // Track which room each user is in
const onlineUsers = new Map(); // Track online users: userId -> socketId

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Authenticate socket connection
  socket.on("authenticate", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
    
    // Notify user's contacts that they're online
    io.emit("userOnline", userId);
  });

  // Send message in a conversation
  socket.on("sendMessage", async (data) => {
    try {
      const { conversationId, content, senderId } = data;
      
      console.log(`Message received from ${senderId} in conversation ${conversationId}: ${content}`);
      
      // Save message to database
      const message = await prisma.message.create({
        data: {
          content,
          conversationId,
          senderId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log(`Message saved to database with ID: ${message.id}`);

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      // Get conversation participants
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId },
        include: { user: true }
      });

      console.log(`Found ${participants.length} participants in conversation`);

      // Send message to all participants (including sender)
      participants.forEach(participant => {
        const recipientSocketId = onlineUsers.get(participant.userId);
        console.log(`Participant ${participant.userId} socket: ${recipientSocketId}`);
        
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receiveMessage", {
            message,
            conversationId
          });
          console.log(`Message sent to ${participant.userId}`);
        } else {
          console.log(`User ${participant.userId} is offline or not authenticated`);
        }
      });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Mark messages as read
  socket.on("markAsRead", async (data) => {
    try {
      const { conversationId, userId } = data;
      
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false
        },
        data: { isRead: true }
      });

      // Notify sender that messages were read
      const messages = await prisma.message.findMany({
        where: { conversationId, senderId: { not: userId } },
        include: { sender: true }
      });

      messages.forEach(msg => {
        const senderSocketId = onlineUsers.get(msg.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", { conversationId });
        }
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Typing indicator
  socket.on("typing", async (data) => {
    try {
      const { conversationId, userId, isTyping } = data;
      
      const participants = await prisma.conversationParticipant.findMany({
        where: { 
          conversationId,
          userId: { not: userId }
        }
      });

      participants.forEach(participant => {
        const recipientSocketId = onlineUsers.get(participant.userId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("userTyping", { conversationId, userId, isTyping });
        }
      });
    } catch (error) {
      console.error("Error sending typing indicator:", error);
    }
  });

  // Start video call
  socket.on("startVideoCall", async (data) => {
    try {
      const { conversationId, callerId, callerName } = data;
      
      console.log(`Video call started by ${callerId} (${callerName}) in conversation ${conversationId}`);
      
      // Join the caller to a room (using conversationId as room name)
      socket.join(conversationId);
      
      const participants = await prisma.conversationParticipant.findMany({
        where: { 
          conversationId,
          userId: { not: callerId }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      console.log(`Notifying ${participants.length} participants about incoming call`);

      participants.forEach(participant => {
        const recipientSocketId = onlineUsers.get(participant.userId);
        console.log(`Participant ${participant.userId}, socket: ${recipientSocketId}`);
        
        if (recipientSocketId) {
          // Join recipient to the same room
          io.sockets.sockets.get(recipientSocketId)?.join(conversationId);
          
          io.to(recipientSocketId).emit("incomingCall", {
            conversationId,
            callerId,
            callerName
          });
          console.log(`Call notification sent to ${participant.userId}`);
        } else {
          console.log(`Participant ${participant.userId} is offline`);
        }
      });
    } catch (error) {
      console.error("Error starting video call:", error);
    }
  });

  // WebRTC signaling - simplified broadcast to room
  socket.on("signalingMessage", (data) => {
    try {
      const { conversationId, message } = data;
      
      console.log(`Signaling message type: ${message.type} in room ${conversationId}`);
      
      // Broadcast to all others in the room (simpler approach like Omegle)
      socket.broadcast.to(conversationId).emit("signalingMessage", message);
      
      console.log(`Signaling message broadcasted to room ${conversationId}`);
    } catch (error) {
      console.error("Error sending signaling message:", error);
    }
  });

  socket.on("acceptCall", (data) => {
    const { conversationId } = data;
    console.log(`Call accepted in room ${conversationId}`);
    // Broadcast to room (simpler approach)
    socket.broadcast.to(conversationId).emit("callAccepted");
  });

  socket.on("rejectCall", (data) => {
    const { conversationId } = data;
    console.log(`Call rejected in room ${conversationId}`);
    // Broadcast to room
    socket.broadcast.to(conversationId).emit("callRejected");
  });

  socket.on("endCall", (data) => {
    try {
      const { conversationId } = data;
      
      console.log(`Call ended in room ${conversationId}`);
      
      // Broadcast to room (simpler approach like Omegle)
      socket.broadcast.to(conversationId).emit("callEnded");
      
      // Leave the room
      socket.leave(conversationId);
      
      console.log(`Socket left room ${conversationId}`);
    } catch (error) {
      console.error("Error handling end call:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Find and remove user from online users
    let disconnectedUserId = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        onlineUsers.delete(userId);
        break;
      }
    }

    if (disconnectedUserId) {
      io.emit("userOffline", disconnectedUserId);
    }
  });
});

// ============ AUTHENTICATION ROUTES ============

app.get("/", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("login", { error: null });
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", { error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.render("login", { error: "Invalid email or password" });
    }

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { error: "An error occurred. Please try again." });
  }
});

app.get("/signup", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }
  res.render("signup", { error: null });
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.render("signup", { error: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.render("signup", { error: "Passwords do not match" });
    }

    if (password.length < 6) {
      return res.render("signup", { error: "Password must be at least 6 characters long" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.render("signup", { error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    req.session.userId = user.id;
    req.session.userName = user.name;
    req.session.userEmail = user.email;

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Signup error:", error);
    res.render("signup", { error: "An error occurred. Please try again." });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

// ============ DASHBOARD & CHAT ROUTES ============

app.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Get all conversations for the user
    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        conversation: {
          updatedAt: 'desc'
        }
      }
    });

    // Format conversations for the view
    const formattedConversations = conversations.map(cp => {
      const otherParticipant = cp.conversation.participants.find(
        p => p.userId !== userId
      );
      const lastMessage = cp.conversation.messages[0];

      return {
        id: cp.conversation.id,
        otherUser: otherParticipant ? otherParticipant.user : null,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt
        } : null,
        updatedAt: cp.conversation.updatedAt
      };
    });

    res.render("dashboard", {
      user: {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail
      },
      conversations: formattedConversations
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("An error occurred");
  }
});

// API to get messages for a conversation
app.get("/api/conversations/:conversationId/messages", requireAuth, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.session.userId;

    // Verify user is part of the conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: "Access denied" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// API to search users
app.get("/api/users/search", requireAuth, async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.session.userId;

    if (!query || query.length < 2) {
      return res.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10
    });

    res.json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// API to create or get conversation with a user
app.post("/api/conversations", requireAuth, async (req, res) => {
  try {
    const { otherUserId } = req.body;
    const userId = req.session.userId;

    if (!otherUserId || otherUserId === userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId }
            }
          },
          {
            participants: {
              some: { userId: otherUserId }
            }
          }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (existingConversation) {
      return res.json({ conversation: existingConversation });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId },
            { userId: otherUserId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    res.json({ conversation });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

app.get("/chat", (req, res) => {
  res.render("chat");
});


server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
