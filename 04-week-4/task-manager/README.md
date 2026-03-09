# 📋 Task Manager — MERN Stack Kanban Board

A full-stack task management application built with the **MERN stack** (MongoDB, Express, React, Node.js). Features a dark neon-themed Kanban board with Turkish UI, real-time filtering, and subtask tracking.

---

## ✨ Features

- **Kanban Board** — Three columns: Yapılacak (Todo), Devam Ediyor (In Progress), Tamamlandı (Done)
- **Task CRUD** — Create, read, update, and delete tasks via REST API
- **Subtask Tracking** — Add subtasks with completion checkboxes and progress counter
- **Priority Levels** — Düşük, Orta, Yüksek, Acil (with color-coded badges)
- **Categories** — İş, Kişisel, Okul (with color-coded badges)
- **Due Date Warnings** — Overdue (🔴 Gecikmiş), Today (🟠 Bugün), Upcoming (🔵 X gün kaldı)
- **Dashboard Stats** — Toplam, Tamamlanan, Geciken, Bugün Biten
- **Live Filtering** — Filter by category, priority, and search text
- **Dark Neon UI** — Modern dark theme with vibrant accent colors

---

## 📂 Project Structure

```
task-manager/
├── server/                         # Backend (Node.js + Express)
│   ├── server.js                   # Entry point (port 3000)
│   ├── .env                        # Environment variables
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   └── Task.js                 # Mongoose schema
│   ├── controllers/
│   │   └── taskController.js       # CRUD logic
│   ├── routes/
│   │   └── taskRoutes.js           # API routes
│   └── middleware/
│       └── errorHandler.js         # Global error handler
│
└── client/                         # Frontend (React + Vite)
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── main.jsx                # React entry
        ├── App.jsx                 # Root component + global state
        ├── index.css               # Dark neon theme styles
        ├── components/
        │   ├── TaskList.jsx        # Kanban board (3 columns)
        │   ├── TaskCard.jsx        # Individual task card
        │   ├── TaskForm.jsx        # Create task modal
        │   └── FilterBar.jsx       # Filter dropdowns + search
        └── services/
            └── api.js              # Axios HTTP client
```

---

## 🛠️ Tech Stack

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React 19, Vite, Axios          |
| Backend    | Node.js, Express               |
| Database   | MongoDB, Mongoose              |
| Styling    | Vanilla CSS (dark neon theme)  |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+)
- **MongoDB** — either [MongoDB Community](https://www.mongodb.com/try/download/community) locally or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/task-manager
```

> For MongoDB Atlas, replace `MONGO_URI` with your connection string:
> `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/task-manager`

### 3. Run the Application

```bash
# Terminal 1 — Start the backend
cd server
npm run dev

# Terminal 2 — Start the frontend
cd client
npm run dev
```

- **Backend API:** http://localhost:3000
- **Frontend App:** http://localhost:5173

---

## 📡 API Endpoints

| Method   | Endpoint           | Description         |
|----------|--------------------|---------------------|
| `GET`    | `/api/tasks`       | Get all tasks       |
| `POST`   | `/api/tasks`       | Create a new task   |
| `PUT`    | `/api/tasks/:id`   | Update a task       |
| `DELETE` | `/api/tasks/:id`   | Delete a task       |

**Query parameters** for `GET /api/tasks`:

| Param      | Example               | Description             |
|------------|-----------------------|-------------------------|
| `status`   | `?status=todo`        | Filter by status        |
| `category` | `?category=Okul`      | Filter by category      |
| `priority` | `?priority=Yüksek`    | Filter by priority      |

---

## 📦 Task Schema

```js
{
  title:       String,          // Required
  description: String,
  category:    "İş" | "Kişisel" | "Okul",
  priority:    "Düşük" | "Orta" | "Yüksek" | "Acil",
  status:      "todo" | "in-progress" | "done",
  dueDate:     Date,
  subtasks:    [{ title: String, isCompleted: Boolean }],
  createdAt:   Date,            // Auto-generated
  updatedAt:   Date             // Auto-generated
}
```

---

## 🎨 Architecture & Patterns

- **Monorepo** — `server/` and `client/` in one repository
- **MVC Pattern** — Models, Controllers, Routes on the backend
- **State Lifting** — `App.jsx` manages global state and passes callbacks as props
- **Derived State** — Dashboard stats computed from the tasks array using `.filter().length`
- **Controlled Components** — Filter inputs bound to React state

---

## 👤 Author

BEU Web Tabanlı Programlama — Week 4 Project
