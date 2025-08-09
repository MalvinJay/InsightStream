# Makefile
.PHONY: setup start stop restart logs clean test health rebuild

# Default target
all: setup

# Setup the entire project
setup:
	@chmod +x setup.sh
	@./setup.sh setup

# Quick start
quick:
	@chmod +x quick-start.sh
	@./quick-start.sh

# Start services
start:
	@docker-compose up -d
	@echo "✅ Services started"

# Stop services  
stop:
	@docker-compose down
	@echo "🛑 Services stopped"

# Restart services
restart:
	@docker-compose restart
	@echo "🔄 Services restarted"

# Show logs
logs:
	@docker-compose logs -f

# Clean up everything
clean:
	@chmod +x setup.sh
	@./setup.sh cleanup

# Test API endpoints
test:
	@chmod +x test-api.sh
	@./test-api.sh

# Check service health
health:
	@chmod +x setup.sh
	@./setup.sh health

# Rebuild services
rebuild:
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "🔨 Services rebuilt and started"

# Development mode (local)
dev-backend:
	@cd backend && npm run dev

dev-frontend:
	@cd frontend && npm run dev

# Install dependencies
install:
	@cd backend && npm install
	@cd frontend && npm install
	@echo "📦 Dependencies installed"

# Production build
build:
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
	@echo "🏭 Production build completed"

# Production start
prod:
	@docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "🚀 Production services started"