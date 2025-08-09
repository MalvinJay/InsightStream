#!/bin/bash
# setup.sh - Complete InsightStream setup script

set -e

echo "🚀 InsightStream Setup Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check if required tools are installed
check_prerequisites() {
    print_header "Checking Prerequisites..."
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check for Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check for Node.js (for local development)
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Docker-only setup will be used."
    else
        NODE_VERSION=$(node --version)
        print_status "Node.js version: $NODE_VERSION"
    fi
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        print_warning "npm is not installed. Docker-only setup will be used."
    fi
    
    print_status "Prerequisites check completed!"
}

# Create project structure
create_project_structure() {
    print_header "Creating Project Structure..."
    
    # Create main directories
    mkdir -p backend/{config,models,routes,services}
    mkdir -p frontend/{components,hooks,lib,pages}
    mkdir -p redis mongodb nginx
    
    print_status "Project directories created!"
}

# Setup environment files
setup_environment() {
    print_header "Setting up Environment Files..."
    
    # Main .env file
    if [ ! -f .env ]; then
        cat > .env << EOF

# InsightStream Environment Configuration
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development

# Database
MONGODB_URI=mongodb://mongodb:27017/insightstream

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Security
JWT_SECRET=$(openssl rand -base64 32)
EOF
        print_status "Created main .env file"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        cat > backend/.env << EOF
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# MongoDB
MONGODB_URI=mongodb://localhost:27017/insightstream

# Security
JWT_SECRET=$(openssl rand -base64 32)
EOF
        print_status "Created backend .env file"
    fi
    
    # Frontend .env.local
    if [ ! -f frontend/.env.local ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
EOF
        print_status "Created frontend .env.local file"
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies..."
    
    # Backend dependencies
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    # Frontend dependencies  
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
}

# Start services with Docker Compose
start_services() {
    print_header "Starting Services with Docker Compose..."
    
    # Pull latest images
    print_status "Pulling Docker images..."
    docker-compose pull
    
    # Build custom images
    print_status "Building custom images..."
    docker-compose build
    
    # Start services
    print_status "Starting all services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    check_services_health
}

# Check if services are running
check_services_health() {
    print_header "Checking Services Health..."
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        print_status "✅ Redis is healthy"
    else
        print_error "❌ Redis is not responding"
    fi
    
    # Check MongoDB
    if docker-compose exec -T mongodb mongosh --quiet --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        print_status "✅ MongoDB is healthy"
    else
        print_error "❌ MongoDB is not responding"
    fi
    
    # Check Backend API
    sleep 5
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        print_status "✅ Backend API is healthy"
    else
        print_error "❌ Backend API is not responding"
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "✅ Frontend is healthy"
    else
        print_error "❌ Frontend is not responding"
    fi
}

# Initialize database with sample data
init_database() {
    print_header "Initializing Database..."
    
    print_status "Sample data will be loaded automatically via init-mongo.js"
    print_status "You can also add more content via the API or frontend interface"
}

# Display access information
show_access_info() {
    print_header "🎉 Setup Complete!"
    echo ""
    echo "Access your InsightStream platform:"
    echo "  🌐 Frontend:     http://localhost:3000"
    echo "  🔧 Backend API:  http://localhost:5000"
    echo "  📊 Redis Insight: http://localhost:8001"
    echo "  🗄️  MongoDB:      localhost:27017"
    echo ""
    echo "Health Check:      http://localhost:5000/health"
    echo "API Documentation: http://localhost:5000/api"
    echo ""
    echo "Useful Commands:"
    echo "  🔍 View logs:      docker-compose logs -f"
    echo "  🛑 Stop services:  docker-compose down"
    echo "  🔄 Restart:        docker-compose restart"
    echo "  🧹 Clean up:       docker-compose down -v"
    echo ""
    print_status "Don't forget to set your OPENAI_API_KEY in the .env file!"
}

# Main setup function
main() {
    print_header "🚀 Starting InsightStream Setup..."
    
    check_prerequisites
    create_project_structure
    setup_environment
    
    # Ask user for setup type
    echo ""
    echo "Choose setup option:"
    echo "1) Docker Compose (Recommended)"
    echo "2) Local Development"
    echo "3) Both"
    read -p "Enter choice [1-3]: " choice
    
    case $choice in
        1)
            print_status "Starting Docker Compose setup..."
            start_services
            init_database
            ;;
        2)
            print_status "Setting up local development environment..."
            install_dependencies
            print_status "Local setup complete. Start Redis and MongoDB manually."
            ;;
        3)
            print_status "Setting up both Docker and local development..."
            install_dependencies
            start_services
            init_database
            ;;
        *)
            print_error "Invalid choice. Defaulting to Docker Compose..."
            start_services
            init_database
            ;;
    esac
    
    show_access_info
}

# Cleanup function
cleanup() {
    print_header "🧹 Cleaning up InsightStream..."
    
    echo "This will remove all containers, volumes, and data. Are you sure? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        docker-compose down -v
        docker system prune -f
        print_status "Cleanup completed!"
    else
        print_status "Cleanup cancelled."
    fi
}

# Development helper functions
dev_logs() {
    print_status "Showing development logs..."
    docker-compose logs -f
}

dev_restart() {
    print_status "Restarting services..."
    docker-compose restart
}

dev_rebuild() {
    print_status "Rebuilding and restarting services..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
}

# Parse command line arguments
case "${1:-setup}" in
    setup)
        main
        ;;
    cleanup)
        cleanup
        ;;
    logs)
        dev_logs
        ;;
    restart)
        dev_restart
        ;;
    rebuild)
        dev_rebuild
        ;;
    health)
        check_services_health
        ;;
    *)
        echo "Usage: $0 {setup|cleanup|logs|restart|rebuild|health}"
        echo ""
        echo "Commands:"
        echo "  setup   - Complete setup (default)"
        echo "  cleanup - Remove all containers and volumes"
        echo "  logs    - Show service logs"
        echo "  restart - Restart all services"
        echo "  rebuild - Rebuild and restart services"
        echo "  health  - Check service health"
        exit 1
        ;;
esac
