# Backend - Whiteboard Realtime

A type-safe Express.js backend with modular architecture, TypeORM, and PostgreSQL.

## Project Structure

```
src/
├── modules/              # Business logic modules
│   └── users/           # User module (example)
│       ├── user.entity.ts      # Database entity
│       ├── user.service.ts     # Business logic
│       ├── user.controller.ts  # Request handlers
│       ├── user.routes.ts      # Route definitions
│       └── index.ts            # Module exports
├── db/                  # Database configuration
│   ├── data-source.ts   # TypeORM connection
│   ├── migrations/      # Database migrations
│   └── subscribers/     # Database subscribers
├── config/              # Configuration files
│   └── env.ts          # Environment variables
├── utils/               # Utility functions
│   └── error.ts        # Error handling
├── middlewares/         # Express middlewares
├── types/               # TypeScript type definitions
├── app.ts              # Express app setup
└── main.ts             # Application entry point
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your database credentials

### Running

**Development:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

## Creating New Modules

To create a new module (e.g., `products`), follow this structure:

```
src/modules/products/
├── product.entity.ts
├── product.service.ts
├── product.controller.ts
├── product.routes.ts
└── index.ts
```

1. Define the entity with TypeORM decorators
2. Create the service with business logic
3. Create the controller for route handlers
4. Define routes in routes file
5. Export everything in index.ts
6. Import and register routes in `src/app.ts`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Database

TypeORM is configured for PostgreSQL in `src/db/data-source.ts`. 

**Features:**
- Automatic synchronization in development
- Type-safe entities with decorators
- Built-in migrations support

## Architecture Benefits

- **Modular**: Each feature is self-contained
- **Type-safe**: Full TypeScript support
- **Scalable**: Easy to add new modules
- **Maintainable**: Clear separation of concerns
- **Testable**: Services can be tested independently

## Environment Variables

See `.env.example` for all available configuration options.

## Error Handling

Custom error class available in `src/utils/error.ts` for consistent error responses.

```typescript
throw new ApiError(400, 'Invalid request');
```

## License

ISC
