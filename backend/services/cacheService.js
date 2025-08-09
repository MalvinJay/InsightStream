const { client: redisClient } = require('../config/redis');
const aiService = require('./aiService');

class CacheService {

  // Get cached AI response
  async getCachedResponse(text, operation) {
    try {
      const key = aiService.generateCacheKey(text, operation);
      const cached = await redisClient.get(key);

      if (cached) {
        console.log(`✅ Cache hit for ${operation}`);
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      console.error('Cache retrieval failed:', error);
      return null;
    }
  }

  // Cache AI response
  async cacheResponse(text, operation, response, ttl = 3600) {
    try {
      const key = aiService.generateCacheKey(text, operation);
      await redisClient.setex(key, ttl, JSON.stringify(response));
      console.log(`✅ Cached ${operation} response`);
    } catch (error) {
      console.error('Cache storage failed:', error);
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const info = await redisClient.info('memory');
      const keyspace = await redisClient.info('keyspace');

      // Count cache keys
      const cacheKeys = await redisClient.keys('ai_cache:*');

      return {
        total_memory: this.parseMemoryInfo(info, 'used_memory_human'),
        cache_keys: cacheKeys.length,
        keyspace_info: keyspace
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {};
    }
  }

  parseMemoryInfo(info, key) {
    const lines = info.split('\r\n');
    const line = lines.find(l => l.startsWith(key));
    return line ? line.split(':')[1] : 'Unknown';
  }
}

module.exports = new CacheService();
