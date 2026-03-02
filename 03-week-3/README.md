# BEUBlog – Full-Stack MERN Blog Platform

A modern, responsive, and fully containerized full-stack blog platform built with the MERN stack (MongoDB, Express, React, Node.js).

This project was developed as part of the Web Programming curriculum at Bitlis Eren University (BEU).

It features a complete RESTful API, secure JWT authentication, rich text editing, image uploading, and a production-ready Dockerized deployment using Nginx.

---

## ✨ Features

- **Authentication:** Secure user registration and login using JWT (JSON Web Tokens) and bcrypt password hashing.
- **Content Management:** Full CRUD (Create, Read, Update, Delete) operations for blog posts.
- **Rich Text Editing:** Integrated `react-quill` for formatting post content with HTML.
- **Image Uploads:** Custom backend endpoint using `multer` to handle and serve cover images.
- **Interactivity:** Users can "Like" posts and filter content by categories.
- **UI/UX:** Responsive design built with Tailwind CSS, featuring a persistent Dark/Light mode toggle.
- **DevOps Ready:** Completely containerized using Docker and Docker Compose, with Nginx serving the frontend and handling routing.

---

## 🛠️ Technology Stack

### Frontend
- React 18 (Vite)
- React Router DOM
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express.js 5
- Mongoose

### Database
- MongoDB

### Deployment
- Docker
- Docker Compose
- Nginx

---

## 🚀 Quick Start (Docker)

To run this project locally, you only need to have Docker Desktop installed:

https://www.docker.com/products/docker-desktop/

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/FKAV64/BEU_Web_Tabanli_Programlama/tree/main/03-week-3
cd beublog
```

---

### 2️⃣ Start the Application

```bash
docker compose up --build
```

---

## 🌐 Access the Application

- **Frontend:** http://localhost  
- **Backend API:** http://localhost:5000  

---

# 👑 Admin Setup & Adding Categories

By default, the MongoDB database is empty upon the first launch.  
Category creation is protected by an `adminOnly` backend middleware.

Follow these steps to create your first admin user and add categories:

---

## Step 1: Register and Elevate to Admin

1. Go to:
   http://localhost/register

2. Create a standard user account.

3. Open your terminal in the project root and run:

```bash
docker exec -it beublog-backend node make-admin.js <your-email@example.com>
```

⚠️ Important:  
Log out of the web interface and log back in to receive your new Admin JWT token.

---

## Step 2: Add a Category via Browser Console

Currently, categories are added directly via the API.

While logged in as an admin:

1. Press F12 (or Right-Click → Inspect).
2. Open the **Console** tab.
3. Paste the following code:

```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:5000/api/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ 
    name: 'Software', 
    slug: 'software', 
    description: 'All things related to programming and software development.' 
  })
})
.then(res => res.json())
.then(data => console.log('Category Added:', data))
.catch(err => console.error('Error:', err));
```

You can modify the `name`, `slug`, and `description` fields to create additional categories.

New categories will immediately appear in the **Create Post** dropdown menu.

---

# 🛑 Stopping the Application

To stop the containers and shut down the Docker network:

```bash
docker compose down
```

---

## 📁 Project Structure (High-Level)

```
beublog/
│
├── frontend/        # React (Vite) application
├── backend/         # Express REST API
├── nginx/           # Reverse proxy configuration
├── docker-compose.yml
└── README.md
```

---

## 📜 License

This project was developed for educational purposes as part of the Web Programming course at Bitlis Eren University.

You are free to modify and extend it for learning or personal use.