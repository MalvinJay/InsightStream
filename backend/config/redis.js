const Redis = require('ioredis');

const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true
});

// Redis Pub/Sub client
const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

// Vector search configuration
const vectorConfig = {
    index: 'content_embeddings',
    dimensions: 768, // sentence-transformers dimension
    algorithm: 'HNSW',
    distance: 'COSINE'
};

// Initialize vector index
async function initializeVectorIndex() {
    try {
        await redisClient.ft.create(
            vectorConfig.index,
            {
                '$.embedding': {
                    type: 'VECTOR',
                    ALGORITHM: vectorConfig.algorithm,
                    TYPE: 'FLOAT32',
                    DIM: vectorConfig.dimensions,
                    DISTANCE_METRIC: vectorConfig.distance
                },
                '$.content_id': { type: 'TEXT' },
                '$.type': { type: 'TAG' },
                '$.timestamp': { type: 'NUMERIC' }
            },
            { ON: 'JSON', PREFIX: 'content:' }
        );
        console.log('✅ Vector index initialized');
    } catch (error) {
        if (error.message.includes('Index already exists')) {
            console.log('✅ Vector index already exists');
        } else {
            console.error('❌ Vector index initialization failed:', error);
        }
    }
}

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
    initializeVectorIndex();
});

redisClient.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
});

module.exports = {
    client: redisClient,
    pubClient,
    subClient,
    vectorConfig
};
