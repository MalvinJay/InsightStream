#!/bin/bash
# quick-start.sh - Quick start script for immediate demo

echo "🚀 InsightStream Quick Start"
echo "============================="

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY environment variable is not set."
    echo "   AI features will not work without it."
    echo ""
    echo "   Set it with: export OPENAI_API_KEY='your-key-here'"
    echo "   Or add it to the .env file"
    echo ""
fi

# Quick Docker setup
echo "📦 Starting services with Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
echo "🔍 Checking service health..."

# Backend health check
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend API: Running"
else
    echo "❌ Backend API: Not responding"
fi

# Frontend check
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: Running"
else
    echo "❌ Frontend: Not responding"
fi

# Redis check
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Running"
else
    echo "❌ Redis: Not responding"
fi

echo ""
echo "🌟 InsightStream is ready!"
echo ""
echo "🔗 Quick Links:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   Health:    http://localhost:5000/health"
echo ""
echo "🎯 Demo Steps:"
echo "   1. Open http://localhost:3000"
echo "   2. Go to 'Content' tab and add some content"
echo "   3. Check 'Streams' tab for real-time events"
echo "   4. Use 'Search' tab for vector similarity search"
echo "   5. Monitor 'Dashboard' for live metrics"
echo ""
echo "📋 Logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
