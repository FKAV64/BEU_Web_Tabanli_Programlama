package middleware
import "github.com/gin-gonic/gin"

func TeacherOnly() gin.HandlerFunc {
	return func(c *gin.Context) { c.Next() }
}
