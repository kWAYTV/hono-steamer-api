# Hono Steamer API

High-performance Steam profile resolver and caching API built with modern TypeScript stack. Optimized for fast lookups with smart caching.

## Core Features

- ⚡ Steam ID and Custom URL resolution with caching
- 🔒 Type-safe API with OpenAPI specification
- 📝 Structured logging and error handling
- 🛠️ Modern TypeScript stack
- 🚀 Docker-ready with health checks

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) with [@hono/zod-openapi](https://github.com/honojs/middleware)
- **Database**: MySQL with [Drizzle ORM](https://orm.drizzle.team/)
- **Documentation**: [Scalar](https://scalar.com/docs/api-reference)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: [Pino](https://getpino.io/)

## Quick Start

1. Clone and install:

```sh
git clone https://github.com/kWAYTV/hono-steamer-api.git
cd hono-steamer-api
pnpm install
```

2. Configure environment:

```sh
cp .env.example .env
# Edit .env with your settings
```

3. Setup database:

```sh
pnpm gp
```

4. Start development server:

```sh
pnpm dev
```

## API Endpoints

| Method | Path          | Description                     |
| ------ | ------------- | ------------------------------- |
| GET    | /resolve/{id} | Resolve and cache Steam profile |
| POST   | /refresh/{id} | Force refresh a Steam profile   |
| GET    | /doc          | OpenAPI Specification           |
| GET    | /reference    | API Documentation               |

## Environment Variables

| Variable     | Description               | Default              |
| ------------ | ------------------------- | -------------------- |
| NODE_ENV     | Environment mode          | development          |
| PORT         | Server port               | 9999                 |
| LOG_LEVEL    | Logging level             | debug                |
| MYSQL\_\*    | MySQL connection settings | -                    |
| BEARER_TOKEN | API authentication token  | -                    |
| BASE_URL     | CORS/CSRF origin URL      | Environment specific |

## Development

```sh
pnpm dev     # Start development server
pnpm test    # Run tests
pnpm lint    # Lint code
pnpm build   # Build for production
```

## Docker Deployment

```sh
docker compose up -d
```

## Acknowledgments

This project builds upon several excellent open-source works:

- [hono-open-api-starter](https://github.com/w3cj/hono-open-api-starter) by [@w3cj](https://github.com/w3cj) - Foundation for type-safe Hono APIs
- [steamid-resolver](https://github.com/3urobeat/node-steamid-resolver) by [@3urobeat](https://github.com/3urobeat) - Core Steam ID resolution functionality

## License

[MIT](LICENSE) © [kWAY](https://github.com/kWAYTV)
