## Database Setup

### PostgreSQL with Docker

Start the PostgreSQL database:
```bash
docker-compose up -d
# Starts PostgreSQL in detached mode (background)
```

Stop the PostgreSQL database:
```bash
docker-compose down
# Stops and removes the PostgreSQL container
```

View database logs:
```bash
docker-compose logs postgres
# Shows PostgreSQL container logs
```

### Prisma Commands

#### Database Schema Management
```bash
# Generate Prisma client (run after schema changes)
pnpx prisma generate

# Push schema changes to database (development)
pnpx prisma db push

# Create and apply migrations (production)
pnpx prisma migrate dev --name <migration-name>

# Apply pending migrations
pnpx prisma migrate deploy
```

#### Database Inspection & Management
```bash
# Open Prisma Studio (database GUI)
pnpx prisma studio

# View current database schema
pnpx prisma db pull

# Reset database (WARNING: deletes all data)
pnpx prisma migrate reset

# Seed database with initial data
pnpx prisma db seed
```

#### Prisma Client
```bash
# Install Prisma client
pnpm add @prisma/client

# Update Prisma client after schema changes
pnpx prisma generate
```

## Getting Started

First, start the database and set up Prisma:

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Push schema to database
pnpx prisma db push

# 3. Generate Prisma client
pnpx prisma generate

# 4. (Optional) Seed database
pnpx prisma db seed
```

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
