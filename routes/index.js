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
    const uptime = process.uptime();
    const uptimeHours = Math.floor(uptime / 3600);
    const uptimeMinutes = Math.floor((uptime % 3600) / 60);
    const uptimeSeconds = Math.floor(uptime % 60);

    res.json({
        message: "🚀 Chat App Backend Server",
        status: "online",
        health: "healthy",
        uptime: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        endpoints: {
            health: "GET /health",
            keepAlive: "GET /keep-alive",
            clerkWebhook: "POST /api/clerk-webhook",
            syncUser: "POST /api/sync-user",
            socket: "WebSocket connection available"
        }
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
