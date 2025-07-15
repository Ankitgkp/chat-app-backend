import express from 'express';
import { handleUserUpsert, handleUserDelete, syncUser } from '../services/userService.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Keep-alive endpoint
router.get('/keep-alive', (req, res) => {
    res.status(200).json({
        status: 'alive',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Basic API endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Chat App Backend is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Clerk webhook
router.post('/api/clerk-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const payload = JSON.parse(req.body.toString());
        const { type: eventType, data } = payload;

        console.log('Clerk webhook received:', eventType);

        switch (eventType) {
            case 'user.created':
            case 'user.updated':
                await handleUserUpsert(data);
                break;
            case 'user.deleted':
                await handleUserDelete(data);
                break;
            default:
                console.log('Unhandled event type:', eventType);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Manual user sync
router.post('/api/sync-user', async (req, res) => {
    try {
        const { clerkId } = req.body;
        if (!clerkId) {
            return res.status(400).json({ error: 'clerkId is required' });
        }

        const result = await syncUser(clerkId);
        res.json(result);
    } catch (error) {
        console.error('Manual sync error:', error);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

export default router;
