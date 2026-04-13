# CampusConnect
Öğrenci: xxxxxxxxxxxxxxx
Okul No: ***************

## Setup & Deployment Instructions

You can start the entire stack (PostgreSQL database, NestJS REST/GraphQL API, and Go Analytics/Webhook Microservice) seamlessly using Docker Compose.

1. Ensure Docker Desktop or Docker Engine is installed and running.
2. From the root directory containing `docker-compose.yml`, run:
   ```bash
   docker-compose up -d
   ```
3. The services will automatically spin up in the background. NestJS will run database migrations on boot.
   - NestJS endpoints are exposed at `http://localhost:3000`
   - Go Microservice is exposed at `http://localhost:8080`

## API Endpoints Overview

| Service | Protocol | Endpoint Path | Method | Description |
|---|---|---|---|---|
| NestJS | REST | `/api/v1/auth/register` | POST | Register a new user |
| NestJS | REST | `/api/v1/auth/login` | POST | Login and receive a JWT. |
| NestJS | REST | `/api/v1/events` | POST | Create a new event (Protected) |
| NestJS | REST | `/api/v1/events` | GET | Fetch events list (Paginated/Filtered) |
| NestJS | REST | `/api/v1/events/:id` | GET | Details for a single event |
| NestJS | REST | `/api/v1/events/:id` | PATCH | Update an event (Protected) |
| NestJS | REST | `/api/v1/events/:id` | DELETE | Delete an event (Protected) |
| NestJS | GraphQL | `/graphql` | POST | GraphQL Queries & Mutations |
| Go | REST | `/api/v1/webhooks/events` | POST | Secure HMAC-verified webhook receiver |
| Go | REST | `/api/v1/notifications` | GET | Retrieve recently parsed webhook alerts |
| Go | REST | `/api/v1/analytics/popular` | GET | List top 5 specific events by participants |
| Go | REST | `/api/v1/analytics/categories`| GET | Total event counts grouped by category |
| Go | REST | `/api/v1/analytics/weekly` | GET | View events registered in the past 7 days |
