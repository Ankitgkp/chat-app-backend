// CORS configuration
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://chat-app-frontend-93hn.vercel.app",
    "https://chat-app-frontend-93hn.vercel.app/",
    /^https:\/\/.*\.onrender\.com$/,
    /^https:\/\/.*\.vercel\.app$/
];

export const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(allowedOrigin => {
            return typeof allowedOrigin === 'string' ?
                allowedOrigin === origin :
                allowedOrigin.test(origin);
        });

        callback(null, true); // Allow all for debugging
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    optionsSuccessStatus: 200
};

export const socketCorsOptions = {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true
};
