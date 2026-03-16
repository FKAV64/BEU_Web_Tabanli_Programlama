# MiniSosyal

A full-stack social media platform built with **Node.js**, **Express**, **Prisma**, **PostgreSQL**, and **React**.

---

## Features

- **Authentication** — Register, login, JWT-based sessions
- **Posts** — Create, edit, delete posts (500-char limit)
- **Likes & Comments** — Toggle likes, add comments with author avatars
- **Search & Pagination** — Search posts by content, "Load More" pagination
- **Profile Management** — Update name and avatar URL
- **Admin Panel** — View all users, admins can delete any post
- **Session Handling** — Auto-redirect to login on expired tokens

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React, Vite, Axios, React Router    |
| Backend    | Node.js, Express, JWT, bcryptjs     |
| Database   | PostgreSQL, Prisma ORM (v7)         |
| DevOps     | Docker, Docker Compose              |

---

## Project Structure

```
minisosyal/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/       # PostCard, NewPost, ProtectedRoute
│   │   ├── context/          # AuthContext (global auth state)
│   │   ├── pages/            # FeedPage, LoginPage, RegisterPage, ProfilePage, AdminPanel
│   │   └── services/         # Axios instance with interceptors
│   └── Dockerfile
├── config/                   # Prisma client instance
├── controllers/              # authController, postController, adminController
├── middleware/                # authGuard, roleGuard
├── prisma/                   # schema.prisma, migrations
├── routes/                   # authRoutes, postRoutes, adminRoutes
├── server.js                 # Express entry point
├── Dockerfile
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- **Node.js** v20+
- **PostgreSQL** installed and running
- **npm**

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd minisosyal

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Configure Environment

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/minisosyal"
JWT_SECRET="your-secret-key"
PORT=5000
```

### 3. Set Up Database

```bash
# Create the database (if not exists)
psql -U postgres -c "CREATE DATABASE minisosyal;"

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 4. Run the Application

```bash
# Terminal 1 — Backend
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:5173

---

## Docker Setup

```bash
docker compose up --build
```

This starts:
- **PostgreSQL** on port 5432
- **Backend API** on port 5000
- **React Frontend** on port 5173

---

## API Endpoints

### Auth
| Method | Endpoint             | Description           | Auth |
|--------|----------------------|-----------------------|------|
| POST   | `/api/auth/register` | Register a new user   | No   |
| POST   | `/api/auth/login`    | Login                 | No   |
| GET    | `/api/auth/me`       | Get current user      | Yes  |
| PUT    | `/api/auth/profile`  | Update name / avatar  | Yes  |

### Posts
| Method | Endpoint                   | Description        | Auth |
|--------|----------------------------|--------------------|------|
| GET    | `/api/posts`               | Get feed (paginated) | No |
| POST   | `/api/posts`               | Create a post      | Yes  |
| PUT    | `/api/posts/:id`           | Edit a post        | Yes  |
| DELETE | `/api/posts/:id`           | Delete a post      | Yes  |
| POST   | `/api/posts/:id/like`      | Toggle like        | Yes  |
| POST   | `/api/posts/:id/comments`  | Add a comment      | Yes  |

### Admin
| Method | Endpoint            | Description      | Auth  |
|--------|---------------------|------------------|-------|
| GET    | `/api/admin/users`  | List all users   | Admin |

---

## Making a User Admin

Connect to your database and run:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your@email.com';
```

---

## License

This project is for educational purposes — BEU Web Programming Course, Week 5.
