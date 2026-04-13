package handlers

import (
	"golearn/database"
	"golearn/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetLessons(c *gin.Context) {
	var lessons []models.Lesson
	database.DB.Where("course_id = ?", c.Param("id")).Order("\"order\" asc").Find(&lessons)
	c.JSON(http.StatusOK, lessons)
}

func CreateLesson(c *gin.Context) {
	var lesson models.Lesson
	if err := c.ShouldBindJSON(&lesson); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Kursun var olduğunu ve kullanıcının sahibi olduğunu doğrula
	var course models.Course
	if err := database.DB.First(&course, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kurs bulunamadı"})
		return
	}
	userID := c.GetUint("user_id")
	if course.TeacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Bu kursa sadece sahibi ders ekleyebilir"})
		return
	}
	lesson.CourseID = course.ID
	database.DB.Create(&lesson)
	c.JSON(http.StatusCreated, lesson)
}
