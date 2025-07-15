import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { corsOptions, socketCorsOptions } from './config/cors.js';
import routes from './routes/index.js';
import { setupSocketHandlers } from './socket/handlers.js';

const app = express();

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/', routes);

// Server setup
const server = http.createServer(app);

// Database connection
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://ankit_user:B5h0sd4kyx@cluster0.ajc6xcq.mongodb.net/chatapp';
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Socket.IO setup
const io = new Server(server, {
    cors: socketCorsOptions,
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    allowUpgrades: true,
    perMessageDeflate: false,
    httpCompression: false,
    maxHttpBufferSize: 1e8, // 100MB
    forceNew: true
});

// Setup socket handlers
setupSocketHandlers(io);

// Start server
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