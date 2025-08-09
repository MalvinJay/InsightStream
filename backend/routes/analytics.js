const express = require('express');
const Content = require('../models/Content');
const cacheService = require('../services/cacheService');
const vectorService = require('../services/vectorService');

const router = express.Router();

// Get platform metrics
router.get('/metrics', async (req, res) => {
    try {
        // Content metrics
        const totalContent = await Content.countDocuments();
        const recentContent = await Content.countDocuments({
            created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        // Sentiment distribution
        const sentimentStats = await Content.aggregate([
            { $match: { 'sentiment.label': { $exists: true } } },
            { $group: { _id: '$sentiment.label', count: { $sum: 1 } } }
        ]);

        // Cache stats
        const cacheStats = await cacheService.getCacheStats();

        // Vector stats
        const vectorStats = await vectorService.getStats();

        res.json({
            content: {
                total: totalContent,
                recent_24h: recentContent,
                sentiment_distribution: sentimentStats
            },
            cache: cacheStats,
            vectors: vectorStats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Analytics retrieval failed:', error);
        res.status(500).json({ error: 'Failed to get analytics' });
    }
});

// Get content engagement stats
router.get('/engagement', async (req, res) => {
    try {
        const { period = '7d' } = req.query;

        const days = period === '24h' ? 1 : period === '7d' ? 7 : 30;
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const engagement = await Content.aggregate([
            { $match: { created_at: { $gte: startDate } } },
            {
                $group: {
                    _id: null,
                    total_views: { $sum: '$views' },
                    total_reactions: { $sum: '$reactions' },
                    avg_engagement: { $avg: { $add: ['$views', '$reactions'] } }
                }
            }
        ]);

        res.json(engagement[0] || { total_views: 0, total_reactions: 0, avg_engagement: 0 });
    } catch (error) {
        console.error('Engagement stats failed:', error);
        res.status(500).json({ error: 'Failed to get engagement stats' });
    }
});

module.exports = router;
