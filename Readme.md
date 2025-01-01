# Emprise Order Tracking System

This document provides instructions for setting up and running the Emprise Order Tracking System locally using Docker.

## Prerequisites

- Docker Desktop
- Node.js (v20 or higher)
- Git
- VSCode (recommended)

## Project Structure

```
├── client/                 # Frontend React application
├── server/                 # Backend Node.js application
│   ├── prisma/            # Database schema and migrations
│   │   ├── migrations/    # Database migrations
│   │   ├── schema.prisma  # Prisma schema
│   │   └── seed.ts       # Database seeding
│   └── src/              # Source code
├── docker-compose.yml     # Docker services configuration
└── README.md             # This file
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd emprise-order-tracking-system
```

### 2. Environment Setup

Create `.env` file in the server directory:

```bash
cd server
cp .env.example .env
```

Ensure your `.env` file contains these variables:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=development
DATABASE_URL=postgresql://postgres:password@postgres:5432/development

# JWT
JWT_SECRET="your-secret-key"
```

### 3. Start the Application

From the root directory, run:

```bash
docker-compose up --build
```

This command will:
- Build and start all containers
- Set up the PostgreSQL database
- Run database migrations
- Seed initial data
- Start both frontend and backend servers

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- pgAdmin (Database Management): http://localhost:5050

### 5. Database Management (pgAdmin)

1. Access pgAdmin at http://localhost:5050
2. Login credentials:
   - Email: admin@admin.com
   - Password: admin

3. Add the database server in pgAdmin:
   - Right click "Servers" → "Register" → "Server"
   - General tab:
     - Name: Project DB
   - Connection tab:
     - Host: postgres
     - Port: 5432
     - Database: development
     - Username: postgres
     - Password: password

### Development Workflow

#### Running Migrations

When you modify the Prisma schema:

```bash
# Generate migration
docker exec -it project_api npx prisma migrate dev --name your_migration_name

# Apply migrations
docker exec -it project_api npx prisma migrate deploy
```

#### Database Seeding

The project uses two types of seeds:

1. Basic Seed (Users, Departments, etc.):
```bash
# Run basic seeds
docker exec -it project_api npx prisma db seed
```

2. Master Data Seed:
```bash
# Run master data seeding
docker exec -it project_api npm run seed:master
```

Note: Run the basic seed first, followed by the master data seed to ensure all dependencies are properly set up.

#### Accessing Database CLI

```bash
# Connect to PostgreSQL CLI
docker exec -it project_db psql -U postgres -d development

# Useful PostgreSQL commands:
\dt         # List all tables
\d+ TABLE   # Describe table
\l          # List databases
\q          # Quit
```

### Stopping the Application

```bash
# Stop containers while keeping data
docker-compose down

# Stop containers and remove data
docker-compose down -v
```

### Troubleshooting

1. If containers fail to start:
```bash
# Remove all containers and volumes
docker-compose down -v
docker system prune -a --volumes

# Rebuild and start
docker-compose up --build
```

2. If database seeding fails:
```bash
# Reset the database
docker exec -it project_api npx prisma migrate reset --force
```

3. If you encounter permission issues:
```bash
# Check logs
docker-compose logs

# For specific service
docker-compose logs server
docker-compose logs postgres
```

## License

[Your License Here]