package middleware
import "github.com/gin-gonic/gin"

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) { c.Next() }
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) { c.Next() }
}
