const express = require('express');
const streamService = require('../services/streamService');

const router = express.Router();

// Get recent stream events
router.get('/:streamKey', async (req, res) => {
    try {
        const { streamKey } = req.params;
        const { count = 50, from = '-' } = req.query;

        const events = await streamService.readStream(streamKey, parseInt(count), from);
        const info = await streamService.getStreamInfo(streamKey);

        res.json({
            stream: streamKey,
            events,
            info
        });
    } catch (error) {
        console.error('Stream read failed:', error);
        res.status(500).json({ error: 'Failed to read stream' });
    }
});

// Add event to stream
router.post('/:streamKey', async (req, res) => {
    try {
        const { streamKey } = req.params;
        const eventData = req.body;

        const eventId = await streamService.addEvent(streamKey, eventData);

        res.status(201).json({ event_id: eventId, stream: streamKey });
    } catch (error) {
        console.error('Stream add failed:', error);
        res.status(500).json({ error: 'Failed to add stream event' });
    }
});

module.exports = router;