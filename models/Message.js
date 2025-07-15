import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    message: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ['text', 'photo', 'video'],
        default: 'text'
    },
    mediaData: {
        type: String,
        default: ""
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Message', messageSchema);
