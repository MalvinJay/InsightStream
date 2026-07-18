const OpenAI = require('openai');
const crypto = require('crypto');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

class AIService {
    // Generate embeddings using OpenAI
    async generateEmbedding(text) {
        try {
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text.slice(0, 8000) // Limit text length
            });

            return response.data[0].embedding;
        } catch (error) {
            console.error('Embedding generation failed:', error);
            throw error;
        }
    }

    // Analyze sentiment
    async analyzeSentiment(text) {
        try {
            const prompt = `Analyze the sentiment of the following text and respond with a JSON object containing "label" (one of: positive, negative, neutral, urgent, informative) and "confidence" (0-1):
                Text: "${text.slice(0, 1000)}"
                Response:`;

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1,
                max_tokens: 100
            });

            const result = JSON.parse(response.choices[0].message.content);
            return result;
        } catch (error) {
            console.error('Sentiment analysis failed:', error);
            return { label: 'neutral', confidence: 0.5 };
        }
    }

    // Generate content summary
    async generateSummary(text) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: `Summarize this content in 2-3 sentences:\n\n${text.slice(0, 2000)}`
                }],
                temperature: 0.3,
                max_tokens: 150
            });

            return response.choices[0].message.content.trim();
        } catch (error) {
            console.error('Summary generation failed:', error);
            return text.slice(0, 200) + '...';
        }
    }

    // Extract tags using AI
    async extractTags(text, title) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: `Extract 3-5 relevant tags from this content. Return as JSON array:
          
Title: ${title}
Content: ${text.slice(0, 1000)}`
                }],
                temperature: 0.2,
                max_tokens: 100
            });

            const tags = JSON.parse(response.choices[0].message.content);
            return Array.isArray(tags) ? tags : [];
        } catch (error) {
            console.error('Tag extraction failed:', error);
            return [];
        }
    }

    // Generate cache key for semantic caching
    generateCacheKey(text, operation) {
        const hash = crypto.createHash('sha256')
            .update(text + operation)
            .digest('hex')
            .slice(0, 16);
        return `ai_cache:${operation}:${hash}`;
    }
}

module.exports = new AIService();
