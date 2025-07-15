import Message from '../models/Message.js';

export function setupSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log(`${socket.id} connected from ${socket.handshake.address}`);

        socket.emit("connection_confirmed", {
            message: "Connected to server",
            serverId: socket.id,
            timestamp: new Date().toISOString()
        });

        socket.on("join_room", async (room) => {
            socket.join(room);
            console.log(`User ${socket.id} joined room: ${room}`);

            try {
                const previousMessages = await Message.find({ room })
                    .sort({ timestamp: 1 })
                    .limit(50);
                socket.emit("previous_messages", previousMessages);
            } catch (error) {
                console.error('Error fetching previous messages:', error);
            }
        });

        socket.on("ping", () => {
            socket.emit("pong", { timestamp: new Date().toISOString() });
        });
        socket.on("send_message", async (data) => {
            await saveMessage(data, 'text');
            socket.to(data.room).emit("message_recieve", data);
        });

        socket.on("send_photo", async (data) => {
            const result = await handleMediaUpload(data, 'photo', 10);
            if (result.success) {
                socket.to(data.room).emit("photo_recieve", data);
                socket.emit("upload_success", { type: "photo", messageId: result.messageId });
            } else {
                socket.emit("upload_error", result.error);
            }
        });

        socket.on("send_video", async (data) => {
            const result = await handleMediaUpload(data, 'video', 20);
            if (result.success) {
                socket.to(data.room).emit("video_recieve", data);
                socket.emit("upload_success", { type: "video", messageId: result.messageId });
            } else {
                socket.emit("upload_error", result.error);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected: " + socket.id);
        });
    });
}

async function saveMessage(data, type, mediaData = null) {
    try {
        const newMessage = new Message({
            room: data.room,
            author: data.author,
            message: data.message || "",
            type,
            mediaData,
            timestamp: new Date()
        });
        return await newMessage.save();
    } catch (error) {
        console.error('Error saving message:', error);
        throw error;
    }
}

async function handleMediaUpload(data, type, maxSizeMB) {
    try {
        const mediaField = type === 'photo' ? 'photo' : 'video';
        const maxSize = maxSizeMB * 1024 * 1024;

        if (data[mediaField] && data[mediaField].length > maxSize) {
            return {
                success: false,
                error: {
                    message: `${type} file too large. Maximum size is ${maxSizeMB}MB.`,
                    type
                }
            };
        }

        const message = await saveMessage(data, type, data[mediaField]);
        return { success: true, messageId: message._id };
    } catch (error) {
        console.error(`Error saving ${type}:`, error);
        return {
            success: false,
            error: {
                message: `Failed to save ${type}. Please try again.`,
                type,
                error: error.message
            }
        };
    }
}
