const initDB = (database) => {
    console.log("MongoDB initialization script");
    const db = database.getSiblingDB('insightstream');

    // Create collections
    db.createCollection('contents');
    db.createCollection('users');
    db.createCollection('analytics');

    // Create indexes for better performance
    db.contents.createIndex({ "title": "text", "content": "text" });
    db.contents.createIndex({ "created_at": -1 });
    db.contents.createIndex({ "type": 1 });
    db.contents.createIndex({ "sentiment.label": 1 });
    db.contents.createIndex({ "tags": 1 });
    db.contents.createIndex({ "author": 1 });

    // Insert sample data
    db.contents.insertMany([
        {
            title: "The Future of AI in Healthcare",
            content: "Artificial intelligence is revolutionizing healthcare by enabling faster diagnoses, personalized treatments, and predictive analytics. Machine learning algorithms can analyze medical images, predict patient outcomes, and assist in drug discovery.",
            type: "article",
            author: "Dr. Sarah Chen",
            tags: ["AI", "Healthcare", "Technology", "Machine Learning"],
            sentiment: { label: "positive", confidence: 0.87 },
            views: 1247,
            reactions: 89,
            shares: 23,
            embedding_id: "emb_sample_1",
            embedding_processed: true,
            word_count: 45,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            updated_at: new Date()
        },
        {
            title: "Climate Change Action Needed Now",
            content: "We need immediate action on renewable energy adoption. The latest IPCC report shows we're running out of time to prevent catastrophic climate change. Solar and wind energy technologies have never been more efficient or affordable.",
            type: "comment",
            author: "EcoActivist22",
            tags: ["Climate", "Environment", "Renewable Energy", "Policy"],
            sentiment: { label: "urgent", confidence: 0.92 },
            views: 856,
            reactions: 156,
            shares: 78,
            embedding_id: "emb_sample_2",
            embedding_processed: true,
            word_count: 52,
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            updated_at: new Date()
        },
        {
            title: "Remote Work Best Practices",
            content: "After three years of remote work evolution, these are the strategies that actually improve team productivity and wellbeing. Communication tools, structured meetings, and work-life balance are crucial for success.",
            type: "article",
            author: "WorkFlow Pro",
            tags: ["Remote Work", "Productivity", "Management", "Technology"],
            sentiment: { label: "informative", confidence: 0.81 },
            views: 2103,
            reactions: 234,
            shares: 67,
            embedding_id: "emb_sample_3",
            embedding_processed: true,
            word_count: 41,
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            updated_at: new Date()
        },
        {
            title: "Cryptocurrency Market Analysis",
            content: "The crypto market shows signs of stabilization after a volatile year. Bitcoin and Ethereum are finding support levels while new DeFi protocols continue to innovate in the financial technology space.",
            type: "article",
            author: "CryptoAnalyst",
            tags: ["Cryptocurrency", "Finance", "Technology", "Market Analysis"],
            sentiment: { label: "neutral", confidence: 0.76 },
            views: 1634,
            reactions: 112,
            shares: 45,
            embedding_id: "emb_sample_4",
            embedding_processed: true,
            word_count: 38,
            created_at: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
            updated_at: new Date()
        },
        {
            title: "Space Exploration Breakthrough",
            content: "NASA's latest mission to Mars has revealed fascinating insights about the planet's geological history. The samples collected could provide evidence of ancient microbial life, revolutionizing our understanding of life in the universe.",
            type: "review",
            author: "SpaceExplorer",
            tags: ["Space", "NASA", "Mars", "Science", "Discovery"],
            sentiment: { label: "positive", confidence: 0.89 },
            views: 3247,
            reactions: 445,
            shares: 189,
            embedding_id: "emb_sample_5",
            embedding_processed: true,
            word_count: 47,
            created_at: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            updated_at: new Date()
        }
    ]);

    print("✅ InsightStream database initialized with sample data");

}

initDB();
