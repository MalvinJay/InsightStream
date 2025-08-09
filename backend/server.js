const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const redisClient = require('./config/redis');
const mongoClient = require('./config/mongodb');
const socketService = require('./services/socketService');

const contentRoutes = require('./routes/content');
const analyticsRoutes = require('./routes/analytics');
const recommendationRoutes = require('./routes/recommendations');
const streamRoutes = require('./routes/streams');

const app = express();
const server = require('http').createServer(app);

// Initialize Socket.IO
socketService.init(server);

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/streams', streamRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            redis: redisClient.status,
            mongodb: mongoClient.readyState === 1 ? 'connected' : 'disconnected'
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 InsightStream Backend running on port ${PORT}`);
    console.log(`📊 Redis Status: ${redisClient.status}`);
    console.log(`🗄️  MongoDB Status: ${mongoClient.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});