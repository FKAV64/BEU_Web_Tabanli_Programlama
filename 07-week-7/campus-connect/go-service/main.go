package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"sync"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

func initDB() {
	var err error
	dbUrl := os.Getenv("DATABASE_URL")
	if dbUrl == "" {
		dbUrl = "postgres://postgres:postgres@localhost:5432/campus_connect?sslmode=disable"
	}
	db, err = sql.Open("postgres", dbUrl)
	if err != nil {
		log.Fatal("Error opening database: ", err)
	}
}

// Memory storage for notifications
type Notification struct {
	Event string `json:"event"`
	Data  struct {
		ID    interface{} `json:"id"`
		Title string      `json:"title"`
		Date  string      `json:"date"`
	} `json:"data"`
}

var notifications []Notification
var notificationsMu sync.Mutex

// RFC 7807 Error Response
type RFC7807 struct {
	Type     string `json:"type"`
	Title    string `json:"title"`
	Status   int    `json:"status"`
	Detail   string `json:"detail"`
	Instance string `json:"instance"`
}

func sendRFC7807(w http.ResponseWriter, r *http.Request, status int, title, detail string) {
	w.Header().Set("Content-Type", "application/problem+json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(RFC7807{
		Type:     fmt.Sprintf("https://httpstatuses.com/%d", status),
		Title:    title,
		Status:   status,
		Detail:   detail,
		Instance: r.URL.Path,
	})
}

// ----------------- Middlewares -----------------

// API Key Middleware
func ApiKeyMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		expectedKey := os.Getenv("API_KEY")
		if expectedKey != "" { // Only validate if env is set
			key := r.Header.Get("X-API-Key")
			if key != expectedKey {
				sendRFC7807(w, r, http.StatusUnauthorized, "Unauthorized", "Invalid or missing API key")
				return
			}
		}
		next(w, r)
	}
}

// Rate Limiter
type rateLimiter struct {
	mu      sync.Mutex
	clients map[string][]time.Time
}

var limiter = &rateLimiter{
	clients: make(map[string][]time.Time),
}

func RateLimitMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}
		limiter.mu.Lock()
		
		now := time.Now()
		var valid []time.Time
		for _, t := range limiter.clients[ip] {
			if now.Sub(t) < time.Minute {
				valid = append(valid, t)
			}
		}
		
		if len(valid) >= 60 { // Strict 60 req / min limit
			limiter.clients[ip] = valid
			limiter.mu.Unlock()
			w.Header().Set("Retry-After", "60")
			sendRFC7807(w, r, http.StatusTooManyRequests, "Too Many Requests", "Rate limit of 60 requests per minute exceeded")
			return
		}
		valid = append(valid, now)
		limiter.clients[ip] = valid
		limiter.mu.Unlock()

		next(w, r)
	}
}

func chain(h http.HandlerFunc) http.HandlerFunc {
	return RateLimitMiddleware(ApiKeyMiddleware(h))
}

// ----------------- Handlers -----------------

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		sendRFC7807(w, r, http.StatusMethodNotAllowed, "Method Not Allowed", "Use POST")
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		sendRFC7807(w, r, http.StatusBadRequest, "Bad Request", "Cannot read body")
		return
	}
	r.Body = io.NopCloser(bytes.NewBuffer(body))

	secret := os.Getenv("WEBHOOK_SECRET")
	signature := r.Header.Get("X-Webhook-Signature")

	if secret != "" {
		mac := hmac.New(sha256.New, []byte(secret))
		mac.Write(body)
		expectedMAC := hex.EncodeToString(mac.Sum(nil))

		if !hmac.Equal([]byte(signature), []byte(expectedMAC)) {
			sendRFC7807(w, r, http.StatusUnauthorized, "Unauthorized", "Invalid signature")
			return
		}
	}

	var notif Notification
	if err := json.Unmarshal(body, &notif); err != nil {
		sendRFC7807(w, r, http.StatusBadRequest, "Bad Request", "Invalid JSON payload format")
		return
	}

	log.Printf("Received Notification: %+v\n", notif)

	notificationsMu.Lock()
	notifications = append(notifications, notif)
	if len(notifications) > 100 {
		notifications = notifications[1:]
	}
	notificationsMu.Unlock()

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"ok"}`))
}

func getNotifications(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendRFC7807(w, r, http.StatusMethodNotAllowed, "Method Not Allowed", "Use GET")
		return
	}
	
	notificationsMu.Lock()
	defer notificationsMu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	if notifications == nil {
		w.Write([]byte(`[]`))
		return
	}
	json.NewEncoder(w).Encode(notifications)
}

func getPopularEvents(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendRFC7807(w, r, http.StatusMethodNotAllowed, "Method Not Allowed", "Use GET")
		return
	}

	query := `
		SELECT e.id, e.title, COUNT(ep."B") as participants_count
		FROM "Event" e
		LEFT JOIN "_EventParticipants" ep ON e.id = ep."A"
		GROUP BY e.id, e.title
		ORDER BY participants_count DESC
		LIMIT 5
	`
	rows, err := db.Query(query)
	if err != nil {
		sendRFC7807(w, r, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var id int
		var title string
		var count int
		if err := rows.Scan(&id, &title, &count); err != nil {
			continue
		}
		results = append(results, map[string]interface{}{
			"id": id,
			"title": title,
			"participants_count": count,
		})
	}
	if results == nil {
		results = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func getCategoriesStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendRFC7807(w, r, http.StatusMethodNotAllowed, "Method Not Allowed", "Use GET")
		return
	}

	query := `SELECT category, COUNT(*) FROM "Event" GROUP BY category`
	rows, err := db.Query(query)
	if err != nil {
		sendRFC7807(w, r, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var cat string
		var count int
		if err := rows.Scan(&cat, &count); err != nil {
			continue
		}
		results = append(results, map[string]interface{}{
			"category": cat,
			"count": count,
		})
	}
	if results == nil {
		results = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func getWeeklyStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendRFC7807(w, r, http.StatusMethodNotAllowed, "Method Not Allowed", "Use GET")
		return
	}

	query := `SELECT id, title, "createdAt" FROM "Event" WHERE "createdAt" >= NOW() - INTERVAL '7 days'`
	rows, err := db.Query(query)
	if err != nil {
		sendRFC7807(w, r, http.StatusInternalServerError, "Internal Server Error", err.Error())
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var id int
		var title string
		var createdAt time.Time
		if err := rows.Scan(&id, &title, &createdAt); err != nil {
			continue
		}
		results = append(results, map[string]interface{}{
			"id": id,
			"title": title,
			"createdAt": createdAt.Format(time.RFC3339),
		})
	}
	if results == nil {
		results = []map[string]interface{}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func main() {
	initDB()
	
	mux := http.NewServeMux()

	mux.HandleFunc("/api/v1/webhooks/events", chain(handleWebhook))
	mux.HandleFunc("/api/v1/notifications", chain(getNotifications))
	mux.HandleFunc("/api/v1/analytics/popular", chain(getPopularEvents))
	mux.HandleFunc("/api/v1/analytics/categories", chain(getCategoriesStats))
	mux.HandleFunc("/api/v1/analytics/weekly", chain(getWeeklyStats))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Run on 8080 or port specified
	}
	fmt.Printf("Go service listening on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}
