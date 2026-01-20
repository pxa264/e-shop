.PHONY: help dev-up dev-down dev-logs dev-restart prod-build prod-up prod-down prod-logs prod-restart clean backup

help:
	@echo "Available commands:"
	@echo "  make dev-up        - Start development environment"
	@echo "  make dev-down      - Stop development environment"
	@echo "  make dev-logs      - View development logs"
	@echo "  make dev-restart   - Restart development environment"
	@echo "  make prod-build    - Build production images"
	@echo "  make prod-up       - Start production environment"
	@echo "  make prod-down     - Stop production environment"
	@echo "  make prod-logs     - View production logs"
	@echo "  make prod-restart  - Restart production environment"
	@echo "  make backup        - Backup database"
	@echo "  make clean         - Remove all containers and volumes"

dev-up:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started at http://localhost:8089"
	@echo "Strapi admin: http://localhost:8089/admin"
	@echo "Database: localhost:5438 (use Navicat to connect)"

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

dev-restart:
	docker-compose -f docker-compose.dev.yml restart

prod-build:
	docker-compose -f docker-compose.prod.yml build --no-cache
	@echo "Production images built successfully"

prod-up:
	docker-compose -f docker-compose.prod.yml up -d
	@echo "Production environment started at http://localhost:8089"

prod-down:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

prod-restart:
	docker-compose -f docker-compose.prod.yml restart

backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U $${DATABASE_USERNAME} $${DATABASE_NAME} > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup created successfully"

clean:
	@echo "Stopping all containers..."
	docker-compose -f docker-compose.dev.yml down -v 2>/dev/null || true
	docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true
	@echo "Cleaning up Docker system..."
	docker system prune -f
	@echo "Cleanup completed"
