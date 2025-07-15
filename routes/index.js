import express from 'express';
import {
    handleUserUpsert,
    handleUserDelete,
    syncUser
} from '../services/userService.js';

const app = express();

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

app.get('/keep-alive', (req, res) => {
    res.status(200).json({
        status: 'alive',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Chat App Backend is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.post(
    '/api/clerk-webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        try {
            const payload = JSON.parse(req.body.toString());
            const { type: eventType, data } = payload;

            console.log('[Clerk Webhook]', eventType);

            switch (eventType) {
                case 'user.created':
                case 'user.updated':
                    await handleUserUpsert(data);
                    break;
                case 'user.deleted':
                    await handleUserDelete(data);
                    break;
                default:
                    console.warn('Unhandled event type:', eventType);
            }

            res.status(200).json({ success: true });
        } catch (err) {
            console.error('Webhook processing error:', err);
            res.status(500).json({ error: 'Failed to process webhook' });
        }
    }
);

app.post('/api/sync-user', async (req, res) => {
    try {
        const { clerkId } = req.body;

        if (!clerkId) {
            return res.status(400).json({ error: 'clerkId is required' });
        }

        const result = await syncUser(clerkId);
        res.json(result);
    } catch (err) {
        console.error('Manual user sync error:', err);
        res.status(500).json({ error: 'Failed to sync user' });
    }
});

export default app;
