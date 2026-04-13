package handlers

import (
	"golearn/database"
	"golearn/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CompleteLesson(c *gin.Context) {
	userID := c.GetUint("user_id")
	var lesson models.Lesson
	if err := database.DB.First(&lesson, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ders bulunamadı"})
		return
	}
	progress := models.Progress{
		UserID:    userID,
		LessonID:  lesson.ID,
		CourseID:  lesson.CourseID,
		Completed: true,
	}
	database.DB.Where("user_id = ? AND lesson_id = ?", userID, lesson.ID).
		FirstOrCreate(&progress)
	progress.Completed = true
	database.DB.Save(&progress)
	c.JSON(http.StatusOK, gin.H{"message": "Ders tamamlandı"})
}

func GetProgress(c *gin.Context) {
	userID := c.GetUint("user_id")

	type CourseProgress struct {
		CourseID    uint    `json:"course_id"`
		CourseTitle string  `json:"course_title"`
		Total       int     `json:"total_lessons"`
		Completed   int     `json:"completed_lessons"`
		Percent     float64 `json:"percent"`
	}

	var courses []models.Course
	database.DB.Find(&courses)

	var result []CourseProgress
	for _, course := range courses {
		var totalLessons int64
		var completedLessons int64
		database.DB.Model(&models.Lesson{}).Where("course_id = ?", course.ID).Count(&totalLessons)
		database.DB.Model(&models.Progress{}).Where(
			"user_id = ? AND course_id = ? AND completed = ?",
			userID, course.ID, true,
		).Count(&completedLessons)

		if totalLessons > 0 {
			result = append(result, CourseProgress{
				CourseID:    course.ID,
				CourseTitle: course.Title,
				Total:       int(totalLessons),
				Completed:   int(completedLessons),
				Percent:     float64(completedLessons) / float64(totalLessons) * 100,
			})
		}
	}
	c.JSON(http.StatusOK, result)
}
