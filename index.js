import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import Message from './models/Message.js';
import User from './models/User.js';

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:5173",
            "https://chat-app-frontend-93hn.vercel.app",
            "https://chat-app-frontend-93hn.vercel.app/",
            // Add any Render backend URL here when you deploy
            /^https:\/\/.*\.onrender\.com$/,
            /^https:\/\/.*\.vercel\.app$/
        ];

        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return allowedOrigin === origin;
            } else if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            // Allow the request anyway for debugging (remove in production)
            callback(null, true);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Additional CORS headers middleware
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "https://chat-app-frontend-93hn.vercel.app",
        "https://chat-app-frontend-93hn.vercel.app/"
    ];

    if (allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin) || /^https:\/\/.*\.onrender\.com$/.test(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Keep-alive endpoint to prevent service from sleeping
app.get('/keep-alive', (req, res) => {
    res.status(200).json({
        status: 'alive',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        connections: io.engine.clientsCount || 0
    });
});

// Basic API endpoint for testing
app.get('/', (req, res) => {
    res.json({
        message: 'Chat App Backend is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

const server = http.createServer(app);

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ankit_user:B5h0sd4kyx@cluster0.ajc6xcq.mongodb.net/chatapp';
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

const io = new Server(server, {
    cors: {
        origin: function (origin, callback) {
            // Allow requests with no origin
            if (!origin) return callback(null, true);

            const allowedOrigins = [
                "http://localhost:3000",
                "http://localhost:5173",
                "https://chat-app-frontend-93hn.vercel.app",
                "https://chat-app-frontend-93hn.vercel.app/",
                /^https:\/\/.*\.onrender\.com$/,
                /^https:\/\/.*\.vercel\.app$/
            ];

            const isAllowed = allowedOrigins.some(allowedOrigin => {
                if (typeof allowedOrigin === 'string') {
                    return allowedOrigin === origin;
                } else if (allowedOrigin instanceof RegExp) {
                    return allowedOrigin.test(origin);
                }
                return false;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                console.log('Socket.IO CORS blocked origin:', origin);
                // Allow anyway for debugging
                callback(null, true);
            }
        },
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        credentials: true
    },
    // Add configuration for better reliability on Render
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    allowUpgrades: true,
    perMessageDeflate: false,
    httpCompression: false,
    // Increase max HTTP buffer size for file uploads
    maxHttpBufferSize: 1e8, // 100MB
    // Force polling transport initially (more reliable on Render free tier)
    forceNew: true
})

io.on("connection", (socket) => {
    console.log(`${socket.id} connected from ${socket.handshake.address}`);

    // Send a welcome message to confirm connection
    socket.emit("connection_confirmed", {
        message: "Connected to server",
        serverId: socket.id,
        timestamp: new Date().toISOString()
    });

    socket.on("join_room", async (data) => {
        socket.join(data)
        console.log(`User with ID: ${socket.id} joined room: ${data}`);

        try {
            const previousMessages = await Message.find({ room: data })
                .sort({ timestamp: 1 })
                .limit(50);

            socket.emit("previous_messages", previousMessages);
        } catch (error) {
            console.error('Error fetching previous messages:', error);
        }
    })

    // Add ping/pong for connection health check
    socket.on("ping", () => {
        socket.emit("pong", { timestamp: new Date().toISOString() });
    });

    socket.onAny((eventName, ...args) => {
        console.log(`Received event: ${eventName}`, args);
    });

    socket.on("send_message", async (data) => {
        try {
            const newMessage = new Message({
                room: data.room,
                author: data.author,
                message: data.message,
                type: 'text',
                timestamp: new Date()
            });
            await newMessage.save();
        } catch (error) {
            console.error('Error saving message:', error);
        }

        socket.to(data.room).emit("message_recieve", data);
    })

    socket.on("send_photo", async (data) => {
        try {
            // Check if photo data is too large
            if (data.photo && data.photo.length > 10 * 1024 * 1024) { // 10MB limit
                socket.emit("upload_error", { 
                    message: "Photo file too large. Maximum size is 10MB.",
                    type: "photo"
                });
                return;
            }

            const newMessage = new Message({
                room: data.room,
                author: data.author,
                message: "",
                type: 'photo',
                mediaData: data.photo,
                timestamp: new Date()
            });
            await newMessage.save();
            
            // Emit to room members
            socket.to(data.room).emit("photo_recieve", data);
            // Confirm to sender
            socket.emit("upload_success", { type: "photo", messageId: newMessage._id });
        } catch (error) {
            console.error('Error saving photo:', error);
            socket.emit("upload_error", { 
                message: "Failed to save photo. Please try again.",
                type: "photo",
                error: error.message
            });
        }
    })

    socket.on("send_video", async (data) => {
        try {
            // Check if video data is too large
            if (data.video && data.video.length > 20 * 1024 * 1024) { // 20MB limit
                socket.emit("upload_error", { 
                    message: "Video file too large. Maximum size is 20MB.",
                    type: "video"
                });
                return;
            }

            const newMessage = new Message({
                room: data.room,
                author: data.author,
                message: "",
                type: 'video',
                mediaData: data.video,
                timestamp: new Date()
            });
            await newMessage.save();
            
            // Emit to room members
            socket.to(data.room).emit("video_recieve", data);
            // Confirm to sender
            socket.emit("upload_success", { type: "video", messageId: newMessage._id });
        } catch (error) {
            console.error('Error saving video:', error);
            socket.emit("upload_error", { 
                message: "Failed to save video. Please try again.",
                type: "video",
                error: error.message
            });
        }
    })

    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
    })
})

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying port ${port + 1}`);
        server.listen(port + 1, () => {
            console.log(`Server is running on port ${port + 1}`);
        });
    } else {
        console.error('Server error:', err);
    }
});