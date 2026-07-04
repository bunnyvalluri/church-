# Kingdom of Christ Ministries - Docker Compose Guide

This guide explains how to run the Kingdom of Christ Ministries platform using Docker Compose for both local development and production. 

This is a lightweight alternative to the Kubernetes deployment for simpler setups, or for local development environments without needing Kubernetes locally.

## 1. Prerequisites

1. Install [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).
2. You need an active Neon PostgreSQL database. 
3. You need a Cloudinary account.

## 2. Environment Configuration

Create a `.env` file in the root directory (you can copy `.env.example`):
```bash
cp .env.example .env
```

Ensure the following variables are set in your `.env` file:
```env
# Point this to your Neon PostgreSQL database
DATABASE_URL="postgresql://user:pass@ep-rest-of-url.neon.tech/kcm?sslmode=require"

# Cloudinary (Media Uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# These should route through Nginx
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_SOCKET_URL=http://localhost
```

## 3. Local Development (`docker-compose.yml`)

The local development configuration mounts your source code directly into the containers. This allows you to edit files on your host machine and see the changes instantly with Next.js and Nodemon hot-reloading, while keeping your Node versions and dependencies perfectly isolated.

**Start Local Development:**
```bash
docker-compose up --build
```
- The API will run at `http://localhost/api`
- The Frontend will run at `http://localhost:3000` (Nginx proxies `http://localhost` to it)
- Redis is automatically provisioned.
- Your `.env` will connect the local containers directly to your Neon DB.

**Stop Environment:**
```bash
docker-compose down
```

## 4. Production Deployment (`docker-compose.prod.yml`)

The production configuration uses pre-compiled, highly-optimized Docker images. It automatically spins up Nginx as an API gateway, splits the backend into API, WebSockets, BullMQ workers, and Cron schedulers to ensure zero event loops blocking and high scalability.

**Start Production:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

**Check Service Health & Logs:**
```bash
# Check if all containers are healthy
docker ps

# Tail logs for a specific service (e.g., backend-api)
docker-compose -f docker-compose.prod.yml logs -f backend-api
```

## 5. Automated Image Builds

This repository is equipped with a GitHub Action (`.github/workflows/docker-publish.yml`). 
Every time you push code to the `main` branch, it will automatically build and publish three images to the GitHub Container Registry (GHCR):
1. `ghcr.io/bunnyvalluri/kcm-frontend`
2. `ghcr.io/bunnyvalluri/kcm-backend`
3. `ghcr.io/bunnyvalluri/kcm-nginx`

If you deploy this to a VPS (like DigitalOcean, AWS EC2, or Hetzner), you can pull these pre-built images and simply run the `docker-compose.prod.yml` file!
