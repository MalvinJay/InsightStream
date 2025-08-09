const { client: redisClient, pubClient } = require('../config/redis');

class StreamService {

    // Add event to stream
    async addEvent(streamKey, eventData) {
        try {
            const eventId = await redisClient.xadd(
                streamKey,
                '*',
                'type', eventData.type,
                'data', JSON.stringify(eventData.data),
                'timestamp', Date.now(),
                'source', eventData.source || 'api'
            );

            // Publish to pub/sub for real-time updates
            await pubClient.publish('stream_events', JSON.stringify({
                stream: streamKey,
                event_id: eventId,
                ...eventData
            }));

            console.log(`✅ Added event to stream ${streamKey}: ${eventId}`);
            return eventId;
        } catch (error) {
            console.error('Failed to add stream event:', error);
            throw error;
        }
    }

    // Read from stream
    async readStream(streamKey, count = 10, fromId = '-') {
        try {
            const results = await redisClient.xread('STREAMS', streamKey, fromId, 'COUNT', count);

            if (results) {
                return results[0][1].map(([id, fields]) => ({
                    id,
                    timestamp: fields[fields.indexOf('timestamp') + 1],
                    type: fields[fields.indexOf('type') + 1],
                    data: JSON.parse(fields[fields.indexOf('data') + 1]),
                    source: fields[fields.indexOf('source') + 1]
                }));
            }

            return [];
        } catch (error) {
            console.error('Failed to read stream:', error);
            return [];
        }
    }

    // Get stream info
    async getStreamInfo(streamKey) {
        try {
            const info = await redisClient.xinfo('STREAM', streamKey);
            return {
                length: info[1],
                first_entry: info[5],
                last_entry: info[7]
            };
        } catch (error) {
            console.error('Failed to get stream info:', error);
            return {};
        }
    }
}

module.exports = new StreamService();
