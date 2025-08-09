const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['article', 'comment', 'review'], required: true },
    author: { type: String, required: true },
    tags: [{ type: String, index: true }],

    // AI Analysis
    sentiment: {
        label: { type: String, enum: ['positive', 'negative', 'neutral', 'urgent', 'informative'] },
        confidence: { type: Number, min: 0, max: 1 }
    },

    // Engagement Metrics
    views: { type: Number, default: 0 },
    reactions: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Embedding Info
    embedding_id: { type: String, unique: true },
    embedding_processed: { type: Boolean, default: false },

    // Metadata
    source_url: String,
    language: { type: String, default: 'en' },
    word_count: Number,

    created_at: { type: Date, default: Date.now, index: true },
    updated_at: { type: Date, default: Date.now }
});

// Update timestamp on save
contentSchema.pre('save', function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model('Content', contentSchema);
