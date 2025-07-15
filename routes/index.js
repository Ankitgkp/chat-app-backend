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

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chat App Backend</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #2d3748;
            }
            
            .container {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 500px;
                width: 90%;
            }
            
            .status-badge {
                display: inline-flex;
                align-items: center;
                background: #10b981;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 1.5rem;
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                margin-right: 0.5rem;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            h1 {
                font-size: 2rem;
                margin-bottom: 0.5rem;
                color: #1a202c;
            }
            
            .subtitle {
                color: #718096;
                margin-bottom: 2rem;
                font-size: 1.1rem;
            }
            
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            
            .stat-card {
                background: #f7fafc;
                padding: 1rem;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
            }
            
            .stat-label {
                font-size: 0.875rem;
                color: #718096;
                margin-bottom: 0.25rem;
            }
            
            .stat-value {
                font-size: 1.25rem;
                font-weight: 600;
                color: #2d3748;
            }
            
            .endpoints {
                margin-top: 2rem;
                text-align: left;
            }
            
            .endpoints h3 {
                margin-bottom: 1rem;
                color: #1a202c;
            }
            
            .endpoint {
                background: #f7fafc;
                padding: 0.75rem;
                border-radius: 6px;
                margin-bottom: 0.5rem;
                border-left: 4px solid #4299e1;
            }
            
            .endpoint-method {
                font-weight: 600;
                color: #4299e1;
                font-size: 0.875rem;
            }
            
            .endpoint-path {
                font-family: 'Monaco', 'Menlo', monospace;
                font-size: 0.875rem;
                color: #2d3748;
            }
            
            .footer {
                margin-top: 2rem;
                padding-top: 1rem;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 0.875rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="status-badge">
                <div class="status-dot"></div>
                Server Online
            </div>
            
            <h1>🚀 Chat App Backend</h1>
            <p class="subtitle">Real-time chat server is running smoothly</p>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-label">Status</div>
                    <div class="stat-value">Healthy</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Uptime</div>
                    <div class="stat-value">${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Version</div>
                    <div class="stat-value">1.0.0</div>
                </div>
            </div>
            
            <div class="endpoints">
                <h3>Available Endpoints</h3>
                <div class="endpoint">
                    <div class="endpoint-method">GET</div>
                    <div class="endpoint-path">/health</div>
                </div>
                <div class="endpoint">
                    <div class="endpoint-method">GET</div>
                    <div class="endpoint-path">/keep-alive</div>
                </div>
                <div class="endpoint">
                    <div class="endpoint-method">POST</div>
                    <div class="endpoint-path">/api/clerk-webhook</div>
                </div>
                <div class="endpoint">
                    <div class="endpoint-method">WebSocket</div>
                    <div class="endpoint-path">Socket.IO Connection</div>
                </div>
            </div>
            
            <div class="footer">
                Last updated: ${new Date().toLocaleString()}
            </div>
        </div>
    </body>
    </html>
    `;

    res.send(html);
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
