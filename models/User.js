import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    imageUrl: {  // Changed from 'avatar' to match Clerk's field name
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastActive: {  // Changed from 'lastLogin' to be more general
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;
