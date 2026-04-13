package handlers

import (
	"golearn/database"
	"golearn/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// @Summary Kursun derslerini getir
// @Description ID bazlı bir kursun içindeki tüm dersleri listeler
// @Tags lessons
// @Produce json
// @Param id path int true "Kurs ID"
// @Success 200 {array} models.Lesson
// @Router /courses/{id}/lessons [get]
func GetLessons(c *gin.Context) {
	var lessons []models.Lesson
	database.DB.Where("course_id = ?", c.Param("id")).Order("\"order\" asc").Find(&lessons)
	c.JSON(http.StatusOK, lessons)
}

// @Summary Kursa yeni ders ekle
// @Description Sadece kursun sahibi olan öğretmen ders ekleyebilir
// @Tags lessons
// @Accept json
// @Produce json
// @Param id path int true "Kurs ID"
// @Param lesson body models.Lesson true "Ders bilgileri"
// @Success 201 {object} models.Lesson
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /courses/{id}/lessons [post]
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
