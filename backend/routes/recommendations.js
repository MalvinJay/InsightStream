const express = require('express');
const vectorService = require('../services/vectorService');
const Content = require('../models/Content');

const router = express.Router();

// Get similar content
router.post('/similar', async (req, res) => {
    try {
        const { text, content_id, limit = 10, filters = {} } = req.body;

        let searchText = text;

        // If content_id provided, use that content's text
        if (content_id) {
            const content = await Content.findById(content_id);
            if (!content) {
                return res.status(404).json({ error: 'Content not found' });
            }
            searchText = content.content;
        }

        // Find similar content
        const similar = await vectorService.findSimilar(searchText, limit, filters);

        // Get full content details
        const contentIds = similar.map(item => item.content_id);
        const contents = await Content.find({ _id: { $in: contentIds } });

        // Merge similarity scores
        const results = contents.map(content => {
            const similarity = similar.find(s => s.content_id === content._id.toString());
            return {
                ...content.toObject(),
                similarity_score: similarity ? similarity.similarity : 0
            };
        });

        // Sort by similarity
        results.sort((a, b) => b.similarity_score - a.similarity_score);

        res.json(results);
    } catch (error) {
        console.error('Similarity search failed:', error);
        res.status(500).json({ error: 'Failed to find similar content' });
    }
});

// Get personalized recommendations
router.get('/personalized/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        // This is a simplified version - in production, you'd use user interaction history
        // For now, get popular recent content
        const recommendations = await Content.find({
            created_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        })
            .sort({ views: -1, reactions: -1 })
            .limit(limit);

        res.json(recommendations);
    } catch (error) {
        console.error('Personalized recommendations failed:', error);
        res.status(500).json({ error: 'Failed to get recommendations' });
    }
});

module.exports = router;
