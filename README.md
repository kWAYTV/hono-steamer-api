# Hono Steamer API

A high-performance Steam profile resolver and caching API built with [Hono](https://hono.dev/), [MySQL](https://www.mysql.com/), and [OpenAPI](https://www.openapis.org/). Optimized for fast lookups with 10-minute smart caching.

## Features

- ⚡ Lightning-fast Steam ID and Custom URL resolution
- 🚀 10-minute smart caching with MySQL
- 📚 Full Steam profile information retrieval
- 🔒 Type-safe routes with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- 📖 Interactive API documentation with [scalar](https://scalar.com/#api-docs)
- 📝 Structured logging with [pino](https://getpino.io/)
- 🛠️ Type-safe schemas with [drizzle](https://orm.drizzle.team/) and [zod](https://zod.dev/)
- 🔄 Automatic profile refresh after 10 minutes

## Setup

Clone the repository:

```sh
git clone https://github.com/kWAYTV/hono-steamer-api.git
cd hono-steamer-api
```

Create & fill `.env` file:

```sh
cp .env.example .env
```

Install dependencies:

```sh
pnpm install
```

Push schema to database:

```sh
pnpm gp
```

Run development server:

```sh
pnpm dev
```

## Endpoints

| Method | Path          | Description                     |
| ------ | ------------- | ------------------------------- |
| GET    | /resolve/{id} | Resolve and cache Steam profile |
| POST   | /refresh/{id} | Force refresh a Steam profile   |
| GET    | /doc          | OpenAPI Specification           |
| GET    | /reference    | Scalar API Documentation        |

## Steam Profile Information

The API caches and provides access to:

- Basic profile info (Steam ID, custom URL)
- Online status and visibility
- Avatar URLs (small, medium, full)
- Account status (VAC bans, trade bans, limitations)
- Profile details (member since, location, real name)
- Most played games
- Group memberships

## Cache System

The API implements a smart caching system:

- 10-minute cache duration for optimal freshness
- Automatic refresh on cache expiry
- Force refresh available via `/refresh` endpoint
- Efficient MySQL storage for cached data

## Development

Lint code:

```sh
pnpm lint
```

Run tests:

```sh
pnpm test
```

## Acknowledgments

This project is built on top of [hono-open-api-starter](https://github.com/w3cj/hono-open-api-starter) by [@w3cj](https://github.com/w3cj), which provides an excellent foundation for building type-safe APIs with Hono.

Special thanks to [@3urobeat](https://github.com/3urobeat) for the excellent [steamid-resolver](https://github.com/3urobeat/node-steamid-resolver) package, which powers the core Steam ID resolution functionality in this API.

## License

[MIT](LICENSE) © [2024 w3cj](https://github.com/w3cj) - [2025 kWAY](https://github.com/kWAYTV)
