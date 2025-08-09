const { client: redisClient, vectorConfig } = require('../config/redis');
const aiService = require('./aiService');

class VectorService {

    // Store content embedding in Redis
    async storeEmbedding(contentId, text, metadata = {}) {
        try {
            // Generate embedding
            const embedding = await aiService.generateEmbedding(text);

            // Prepare vector data
            const vectorData = {
                content_id: contentId,
                embedding: new Float32Array(embedding),
                type: metadata.type || 'article',
                timestamp: Date.now(),
                ...metadata
            };

            // Store in Redis JSON
            const key = `content:${contentId}`;
            await redisClient.json.set(key, '$', vectorData);

            console.log(`✅ Stored embedding for content ${contentId}`);
            return true;
        } catch (error) {
            console.error('Failed to store embedding:', error);
            throw error;
        }
    }

    // Search for similar content
    async findSimilar(text, limit = 10, filters = {}) {
        try {
            // Generate query embedding
            const queryEmbedding = await aiService.generateEmbedding(text);

            // Build search query
            let query = `*`;
            if (filters.type) {
                query = `@type:{${filters.type}}`;
            }

            // Perform vector search
            const results = await redisClient.ft.search(
                vectorConfig.index,
                query,
                {
                    PARAMS: {
                        BLOB: Buffer.from(new Float32Array(queryEmbedding).buffer)
                    },
                    SORTBY: 'VECTOR_SCORE',
                    DIALECT: 2,
                    RETURN: ['content_id', 'type', 'timestamp', 'VECTOR_SCORE'],
                    LIMIT: { from: 0, size: limit }
                }
            );

            return results.documents.map(doc => ({
                content_id: doc.value.content_id,
                type: doc.value.type,
                timestamp: doc.value.timestamp,
                similarity: 1 - parseFloat(doc.value.VECTOR_SCORE) // Convert distance to similarity
            }));
        } catch (error) {
            console.error('Vector search failed:', error);
            return [];
        }
    }

    // Get embedding statistics
    async getStats() {
        try {
            const info = await redisClient.ft.info(vectorConfig.index);
            return {
                total_docs: info.num_docs,
                index_size: info.inverted_sz_mb + 'MB',
                vector_index_size: info.vector_index_sz_mb + 'MB'
            };
        } catch (error) {
            console.error('Failed to get vector stats:', error);
            return {};
        }
    }
}

module.exports = new VectorService();
