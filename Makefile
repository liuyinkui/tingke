.PHONY: dev dev-build migrate seed logs api-logs db-logs redis-logs shell lint clean

# ── Development ────────────────────────────────────────────

## Start full dev environment (API + DB + Redis)
dev:
	docker compose up -d
	@echo "✅ 本地环境已启动"
	@echo "   API:  http://localhost:3000"
	@echo "   DB:   postgresql://localhost:5432"
	@echo "   Redis: redis://localhost:6379"

## Rebuild and start (after dependency changes)
dev-build:
	docker compose up -d --build
	@echo "✅ 重建并启动完成"

## View all logs
logs:
	docker compose logs -f

## View API logs only
api-logs:
	docker compose logs -f api

## View DB logs only
db-logs:
	docker compose logs -f db

## View Redis logs only
redis-logs:
	docker compose logs -f redis

## Open a shell inside the API container
shell:
	docker compose exec api sh

# ── Database ───────────────────────────────────────────────

## Run database migrations
migrate:
	docker compose exec -T api npx knex migrate:latest

## Rollback last migration
migrate-rollback:
	docker compose exec -T api npx knex migrate:rollback

## Seed database
seed:
	docker compose exec -T api npx knex seed:run

## Reset database (rollback + migrate + seed)
db-reset:
	docker compose exec -T api npx knex migrate:rollback
	docker compose exec -T api npx knex migrate:latest
	docker compose exec -T api npx knex seed:run

# ── Quality ────────────────────────────────────────────────

## Run ESLint
lint:
	cd server && npm run lint

## Format code
format:
	cd server && npm run format

# ── Cleanup ────────────────────────────────────────────────

## Stop and remove all containers
clean:
	docker compose down -v
	@echo "✅ 已清理所有容器和数据卷"
