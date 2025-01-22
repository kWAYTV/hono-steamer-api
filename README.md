# Hono Steamer API

A fully documented type-safe Steam ID resolver API built with [Hono](https://hono.dev/) and [OpenAPI](https://www.openapis.org/). Resolves Steam IDs, custom URLs, and caches Steam profile information with a clean CRUD interface.

## Features

- Steam ID and Custom URL resolution with caching
- Full Steam profile information retrieval
- Type-safe routes with [@hono/zod-openapi](https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
- Interactive API documentation with [scalar](https://scalar.com/#api-docs)
- Structured logging with [pino](https://getpino.io/)
- Type-safe schemas with [drizzle](https://orm.drizzle.team/) and [zod](https://zod.dev/)
- Clean CRUD operations for Steam profiles
- Automatic profile refresh after 24 hours

## Setup

Clone the repository:

```sh
git clone https://github.com/kWAYTV/hono-steamer-api.git
cd hono-steamer-api
```

Create `.env` file:

```sh
cp .env.example .env
```

Install dependencies:

```sh
pnpm install
```

Create SQLite database and push schema:

```sh
pnpm gp
```

Run development server:

```sh
pnpm dev
```

## Endpoints

| Method | Path                | Description                     |
| ------ | ------------------- | ------------------------------- |
| GET    | /steam              | List all Steam profiles         |
| POST   | /steam              | Create a Steam profile          |
| GET    | /steam/{id}         | Get one Steam profile by id     |
| PATCH  | /steam/{id}         | Update a Steam profile          |
| DELETE | /steam/{id}         | Delete a Steam profile          |
| GET    | /steam/resolve/{id} | Resolve and cache Steam profile |
| POST   | /steam/refresh/{id} | Force refresh a Steam profile   |
| GET    | /doc                | OpenAPI Specification           |
| GET    | /reference          | Scalar API Documentation        |

## Steam Profile Information

The API caches and provides access to:

- Basic profile info (Steam ID, custom URL)
- Online status and visibility
- Avatar URLs (small, medium, full)
- Account status (VAC bans, trade bans, limitations)
- Profile details (member since, location, real name)
- Most played games
- Group memberships

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

Special thanks to [@3urobeat](https://github.com/3urobeat) for the excellent [steamid-resolver](https://github.com/3urobeat/node-steamid-resolver) package, which powers the core Steam ID resolution functionality in this API.

## License

[MIT](LICENSE) © [2024 w3cj](https://github.com/w3cj) - [2025 kWAY](https://github.com/kWAYTV)
