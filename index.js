import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import Message from './models/Message.js';
import User from './models/User.js';

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const mongoUri = 'mongodb+srv://ankit_user:B5h0sd4kyx@cluster0.ajc6xcq.mongodb.net/chatapp';
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
    }
})

io.on("connection", (socket) => {
    console.log(socket.id + " connected");

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
            const newMessage = new Message({
                room: data.room,
                author: data.author,
                message: "",
                type: 'photo',
                mediaData: data.photo,
                timestamp: new Date()
            });
            await newMessage.save();
        } catch (error) {
            console.error('Error saving photo:', error);
        }

        socket.to(data.room).emit("photo_recieve", data);
    })

    socket.on("send_video", async (data) => {

        try {
            const newMessage = new Message({
                room: data.room,
                author: data.author,
                message: "",
                type: 'video',
                mediaData: data.video,
                timestamp: new Date()
            });
            await newMessage.save();
        } catch (error) {
            console.error('Error saving video:', error);
        }

        socket.to(data.room).emit("video_recieve", data);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected: " + socket.id);
    })
})

const port = 3000;

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});