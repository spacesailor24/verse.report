## Getting Started

1. `pnpm i` To install dependencies
2. `docker-compose up -d` To create the PostgreSQL database
3. `cp .env.example .env` To create the environment variables file
   - Fill in the `DISCORD_CLIENT_SECRET` variable, everything else is setup for dev already
4. `pnpx prisma db push` To push the schema to the database
5. `pnpx prisma generate` To generate the Prisma client
6. `pnpx prisma db seed` To seed the database
7. `pnpm dev` To run the development server
8. Open [http://localhost:3000](http://localhost:3000)
9. Auth with Discord to create a user in the database
10. Run `pnpm list-users` to see the users in the database
11. Use the `Email: me@email.com` as the input for: `pnpm assign-admin` to assign the admin role to the user like so: `pnpm assign-admin me@email.com`
12. Run the transmissions seeding script: `pnpm seed-transmissions` 

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
