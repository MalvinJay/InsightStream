#!/bin/bash
# test-api.sh - Test API endpoints

echo "🧪 Testing InsightStream API"
echo "=============================="

BASE_URL="http://localhost:5000"

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq . || echo "❌ Health check failed"

# Test creating content
echo -e "\n2. Testing content creation..."
CONTENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/content" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article: AI in Healthcare",
    "content": "This is a test article about artificial intelligence applications in healthcare. AI is revolutionizing medical diagnosis and treatment.",
    "type": "article",
    "author": "API Tester"
  }')

echo "$CONTENT_RESPONSE" | jq .

# Extract content ID for further tests
CONTENT_ID=$(echo "$CONTENT_RESPONSE" | jq -r '._id')

# Test retrieving content
echo -e "\n3. Testing content retrieval..."
curl -s "$BASE_URL/api/content?limit=5" | jq '.content | length' || echo "❌ Content retrieval failed"

# Test similarity search
echo -e "\n4. Testing similarity search..."
curl -s -X POST "$BASE_URL/api/recommendations/similar" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "machine learning in medicine",
    "limit": 3
  }' | jq '. | length' || echo "❌ Similarity search failed"

# Test analytics
echo -e "\n5. Testing analytics..."
curl -s "$BASE_URL/api/analytics/metrics" | jq '.content.total' || echo "❌ Analytics failed"

# Test streams
echo -e "\n6. Testing streams..."
curl -s "$BASE_URL/api/streams/content_stream" | jq '.events | length' || echo "❌ Stream test failed"

echo -e "\n✅ API testing completed!"
