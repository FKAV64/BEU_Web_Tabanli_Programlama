Isim : Abdou Valerio Foma Kenfack
# 📚 GoLearn — Uzaktan Eğitim Platformu

A modern, RESTful remote learning (LMS) backend built with **Go**, **Gin**, **GORM**, and **SQLite**. It features JWT authentication, role-based access control, course/lesson management, quiz evaluation, real-time WebSocket classrooms, and interactive Swagger documentation.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **JWT Authentication** | Secure register & login with bcrypt password hashing |
| 👥 **Role-Based Access Control** | `student` and `teacher` roles with guarded routes |
| 📖 **Course Management** | Full CRUD with pagination, category filtering, and sorting |
| 📝 **Lesson Management** | Ordered lessons tied to courses |
| 🧠 **Quiz System** | Create quizzes with multiple-choice questions and auto-grading |
| 📊 **Progress Tracking** | Track completed lessons per student per course |
| 🌐 **Live Classroom (WebSocket)** | Real-time chat per course room |
| ⚡ **Rate Limiting** | IP-based rate limiter to protect the API |
| 📦 **Swagger UI** | Interactive API documentation at `/swagger/index.html` |
| 🐳 **Docker Support** | Multi-stage Dockerfile + Docker Compose for easy deployment |

---

## 🛠️ Tech Stack

- **Language**: Go 1.23
- **Web Framework**: [Gin](https://github.com/gin-gonic/gin)
- **ORM**: [GORM](https://gorm.io) + SQLite driver
- **Auth**: [golang-jwt/jwt v5](https://github.com/golang-jwt/jwt)
- **Password Hashing**: [bcrypt](https://pkg.go.dev/golang.org/x/crypto/bcrypt)
- **WebSocket**: [gorilla/websocket](https://github.com/gorilla/websocket)
- **Rate Limiting**: [golang.org/x/time/rate](https://pkg.go.dev/golang.org/x/time/rate)
- **Docs**: [swaggo/gin-swagger](https://github.com/swaggo/gin-swagger)

---

## 📂 Project Structure

```
golearn/
├── main.go                 # Ana giriş noktası & route tanımları
├── go.mod                  # Go modül tanımı
├── go.sum                  # Bağımlılık hash'leri
├── .gitignore
├── Dockerfile              # Multi-stage Docker image
├── docker-compose.yml      # Container orchestration
│
├── config/
│   └── config.go           # Yapılandırma sabitleri (JWT secret vb.)
│
├── models/
│   ├── user.go             # User struct
│   ├── course.go           # Course struct
│   ├── lesson.go           # Lesson struct
│   ├── quiz.go             # Quiz + Question + QuizResult
│   └── progress.go         # Progress struct
│
├── handlers/
│   ├── auth.go             # Register, Login
│   ├── course.go           # CRUD + pagination
│   ├── lesson.go           # Ders CRUD
│   ├── quiz.go             # Quiz oluştur + çöz
│   ├── progress.go         # İlerleme takibi
│   └── websocket.go        # Canlı sınıf (WebSocket)
│
├── middleware/
│   ├── auth.go             # JWT doğrulama + CORS
│   ├── rbac.go             # TeacherOnly guard
│   └── ratelimit.go        # IP bazlı rate limit
│
├── database/
│   └── db.go               # GORM + SQLite bağlantısı & AutoMigrate
│
└── docs/                   # Swaggo tarafından otomatik üretilir
    ├── docs.go
    ├── swagger.json
    └── swagger.yaml
```

---

## ⚙️ Getting Started

### Prerequisites
- [Go 1.23+](https://go.dev/dl/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) *(optional)*

### Run Locally

```bash
# 1. Clone the repository
git clone <repo-url>
cd golearn

# 2. Download dependencies
go mod tidy

# 3. Start the server
go run main.go
```

The API will be available at: **`http://localhost:8090`**

### Run with Docker

```bash
# Build and start the container
docker compose up --build -d

# Stop the container
docker compose down
```

---

## 📖 API Documentation (Swagger)

After starting the server, open your browser and navigate to:

```
http://localhost:8090/swagger/index.html
```

To test protected endpoints:
1. Register or login to get a JWT token.
2. Click the **Authorize 🔒** button in the top-right of Swagger UI.
3. Enter your token in the format: `Bearer <your_token_here>`.

---

## 🔑 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı |
| `POST` | `/api/auth/login` | Giriş yap, JWT al |

### Courses (JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses` | Tüm kursları listele (sayfalama, filtre, sıralama) |
| `GET` | `/api/courses/:id` | Kurs detayı |
| `POST` | `/api/courses` | Yeni kurs oluştur *(Teacher only)* |
| `PUT` | `/api/courses/:id` | Kurs güncelle *(Owner only)* |
| `DELETE` | `/api/courses/:id` | Kurs sil *(Owner only)* |

### Lessons (JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses/:id/lessons` | Kursun derslerini listele |
| `POST` | `/api/courses/:id/lessons` | Kursa ders ekle *(Teacher only)* |
| `POST` | `/api/lessons/:id/complete` | Dersi tamamlandı olarak işaretle |

### Quiz (JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/lessons/:id/quiz` | Dersin quizini getir |
| `POST` | `/api/lessons/:id/quiz` | Quiz oluştur *(Teacher only)* |
| `POST` | `/api/quiz/:id/submit` | Quiz cevapla ve puanı öğren |

### Progress (JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/my/progress` | Tüm kurslardaki ilerlemeyi görüntüle |

### WebSocket
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/ws/classroom/:courseId` | Canlı sınıfa bağlan (JWT gerekli) |

---

## 🌱 Environment Variables (Planned)

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `golearn-secret` | JWT signing key |
| `DB_PATH` | `golearn.db` | SQLite database file path |
| `PORT` | `8090` | Server port |

---

## 📜 License

This project was built for educational purposes as part of the **BEU Web Tabanlı Programlama** course — Week 8.
