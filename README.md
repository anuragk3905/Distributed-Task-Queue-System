# Distributed Task Queue System

A scalable, distributed task queue architecture built with Node.js, Express, BullMQ, and React. It features real-time monitoring via WebSockets, a robust dashboard for queue management, and modular architecture using Turborepo. It has been fully dockerized for easy deployment and local development.

## 🌟 Live Environments

- **Frontend Dashboard**: [https://distributed-task-queue-system.vercel.app/](https://distributed-task-queue-system.vercel.app/)
- **API Service**: [https://distributed-task-queue-system-api-service.onrender.com](https://distributed-task-queue-system-api-service.onrender.com)
- **Socket Service**: [https://distributed-task-queue-system-socket.onrender.com](https://distributed-task-queue-system-socket.onrender.com)

## 🏗 Architecture

The system is split into multiple decoupled services running inside a **Turborepo** monorepo workspace:

1. **API Service (`apps/api`)**: The core Express.js backend. Handles user authentication (JWT), REST endpoints for job creation, workflows, and serves the BullBoard admin panel. Uses Mongoose to connect to MongoDB and Redis for message brokering.
2. **Dashboard (`apps/dashboard`)**: The React/Vite frontend. It securely queries the API for metrics and jobs, and maintains a WebSocket connection to stream real-time updates of job processing.
3. **Worker Service (`apps/worker`)**: A standalone Node.js process dedicated purely to consuming tasks off the BullMQ Redis queue. Extremely scalable (you can run multiple worker nodes simultaneously).
4. **Socket Service (`apps/socket`)**: A lightweight Socket.io server that acts as a real-time event broadcaster, notifying the frontend when queue events happen.
5. **Shared Packages (`packages/`)**: Contains shared configurations like `queue-config` and `shared` types.

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, React Router, Axios, Socket.io-client.
- **Backend Services**: Node.js, Express.js, TypeScript.
- **Queue Engine**: BullMQ (Redis-based queue mechanism), Bull-Board (Queue UI).
- **Databases**: MongoDB (Main application data, users), Redis (Task queues, caching).
- **Containerization**: Docker, Docker Compose.
- **Tooling**: Turborepo, npm workspaces, ESLint, Prettier.

## 📁 Repository Structure

```
distributed-task-queue/
├── apps/
│   ├── api/            # Express.js REST API & BullBoard
│   ├── dashboard/      # React Frontend (Vite)
│   ├── socket/         # Socket.io Service
│   └── worker/         # BullMQ Task Consumer
├── packages/           # Shared libraries (queue-config, shared)
├── docker-compose.yml  # Docker Compose orchestration
├── package.json        # Root workspace configuration
└── turbo.json          # Turborepo configuration
```

## 🐳 Running with Docker (Recommended)

The easiest way to run the entire cluster locally is via Docker Compose.

### 1. Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose installed.
- A local `.env` file for each service (see Environment Variables section).

### 2. Start the Cluster
Run the following command from the root directory to build and start all services in detached mode:
```bash
docker-compose up --build -d
```

### 3. Access the Services
- **Dashboard**: `http://localhost:5173`
- **API**: `http://localhost:3000`
- **Socket Server**: `http://localhost:4000`
- **Redis**: `localhost:6379`

To view the logs of the running containers:
```bash
docker-compose logs -f
```

To stop the cluster:
```bash
docker-compose down
```

## 🚀 Local Development Setup (Without Docker)

### 1. Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [MongoDB Atlas](https://www.mongodb.com/atlas) (or local MongoDB)
- [Redis](https://redis.io/) (Local or Upstash)

### 2. Installation
Install all dependencies across the entire workspace from the root directory:
```bash
npm install
```

### 3. Running Locally
Because this is a Turborepo workspace, you can easily spin up the entire cluster or run individual services. Open separate terminal windows from the root and run:

```bash
# Terminal 1 - API
cd apps/api
npm run dev

# Terminal 2 - Worker
cd apps/worker
npm run dev

# Terminal 3 - Socket
cd apps/socket
npm run dev

# Terminal 4 - Dashboard
cd apps/dashboard
npm run dev
```

## 🔐 Environment Variables

You will need to create a `.env` file inside each specific app.

**For `apps/api`, `apps/worker`, and `apps/socket`:**
```env
PORT=3000 # or 4000 for socket
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
REDIS_URL=redis://localhost:6379 # When using Docker Compose, it will automatically override to redis://redis:6379
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

**For `apps/dashboard`:**
```env
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:4000
```

*(Note: When running via Docker, `docker-compose.yml` automatically mounts the respective `.env` files for each container.)*

## 🔒 Authentication Flow
The system utilizes HTTP-only, secure cookies for JWT-based authentication. 
- In production (`NODE_ENV="production"`), the API is configured with `sameSite: "none"` and `secure: true` to support cross-domain authentication between the Vercel frontend and Render backend.
- Local development (`NODE_ENV="development"`) falls back to `sameSite: "lax"`.

## 🩺 System Health Monitoring
The platform features an automated `/health` subsystem checking the connectivity of core dependencies:
- **Liveness** (`/health/live`): Ensures the Node process is running.
- **Readiness** (`/health/ready`): Validates active connections to MongoDB and Redis.
- **Overall Status** (`/health`): An authenticated endpoint providing a comprehensive snapshot of system uptime, versioning, and latency.
