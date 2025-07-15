import 'dotenv/config';
import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { corsOptions, socketCorsOptions } from './config/cors.js';
import routes from './routes/index.js';
import { setupSocketHandlers } from './socket/handlers.js';
const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/', routes);
const server = http.createServer(app);

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
    process.exit(1);
}

mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

const io = new Server(server, {
    cors: socketCorsOptions,
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    allowUpgrades: true,
    perMessageDeflate: false,
    httpCompression: false,
    maxHttpBufferSize: 1e8,
    forceNew: true
});

setupSocketHandlers(io);

const port = process.env.PORT || 3000;

server.listen(port, () => {
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        server.listen(port + 1, () => {
        });
    } else {
        console.error('Server error:', err);
    }
});