const express = require('express');
const Content = require('../models/Content');
const aiService = require('../services/aiService');
const vectorService = require('../services/vectorService');
const cacheService = require('../services/cacheService');
const streamService = require('../services/streamService');

const router = express.Router();

// Create new content
router.post('/', async (req, res) => {
    try {
        const { title, content, type, author, tags } = req.body;

        // Create content document
        const newContent = new Content({
            title,
            content,
            type,
            author,
            tags: tags || [],
            embedding_id: `emb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

        await newContent.save();

        // Process with AI (async)
        processContentAsync(newContent);

        // Add to stream
        await streamService.addEvent('content_stream', {
            type: 'content_created',
            data: { content_id: newContent._id, title, type },
            source: 'api'
        });

        res.status(201).json(newContent);
    } catch (error) {
        console.error('Content creation failed:', error);
        res.status(500).json({ error: 'Failed to create content' });
    }
});

// Process content with AI
async function processContentAsync(content) {
    try {
        // Check cache first
        const sentimentCache = await cacheService.getCachedResponse(content.content, 'sentiment');

        let sentiment;
        if (sentimentCache) {
            sentiment = sentimentCache;
        } else {
            sentiment = await aiService.analyzeSentiment(content.content);
            await cacheService.cacheResponse(content.content, 'sentiment', sentiment);
        }

        // Update content with AI results
        content.sentiment = sentiment;
        content.embedding_processed = true;
        content.word_count = content.content.split(' ').length;

        await content.save();

        // Store vector embedding
        await vectorService.storeEmbedding(content._id.toString(), content.content, {
            type: content.type,
            title: content.title
        });

        // Add to stream
        await streamService.addEvent('ai_stream', {
            type: 'content_analyzed',
            data: {
                content_id: content._id,
                sentiment: sentiment.label,
                confidence: sentiment.confidence
            },
            source: 'ai_service'
        });

        console.log(`✅ Processed content: ${content._id}`);
    } catch (error) {
        console.error('Content processing failed:', error);
    }
}

// Get all content with filters
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, type, sentiment } = req.query;

        const query = {};
        if (type) query.type = type;
        if (sentiment) query['sentiment.label'] = sentiment;

        const content = await Content.find(query)
            .sort({ created_at: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Content.countDocuments(query);

        res.json({
            content,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_items: total
            }
        });
    } catch (error) {
        console.error('Content retrieval failed:', error);
        res.status(500).json({ error: 'Failed to retrieve content' });
    }
});

// Get single content item
router.get('/:id', async (req, res) => {
    try {
        const content = await Content.findById(req.params.id);

        if (!content) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Increment view count
        content.views += 1;
        await content.save();

        res.json(content);
    } catch (error) {
        console.error('Content retrieval failed:', error);
        res.status(500).json({ error: 'Failed to retrieve content' });
    }
});

module.exports = router;
