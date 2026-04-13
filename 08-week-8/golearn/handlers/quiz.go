package handlers

import (
	"fmt"
	"golearn/database"
	"golearn/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// @Summary Dersin quizini getir
// @Description Ders ID bazlı quizi ve sorularını listeler
// @Tags quiz
// @Produce json
// @Param id path int true "Ders ID"
// @Success 200 {object} models.Quiz
// @Failure 404 {object} map[string]string
// @Router /lessons/{id}/quiz [get]
func GetQuiz(c *gin.Context) {
	var quiz models.Quiz
	if err := database.DB.Preload("Questions").Where("lesson_id = ?", c.Param("id")).First(&quiz).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz bulunamadı"})
		return
	}
	c.JSON(http.StatusOK, quiz)
}

// @Summary Yeni quiz oluştur
// @Description Derse ait soruları içeren bir quiz oluşturur
// @Tags quiz
// @Accept json
// @Produce json
// @Param id path int true "Ders ID"
// @Param quiz body models.Quiz true "Quiz bilgileri"
// @Success 201 {object} models.Quiz
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /lessons/{id}/quiz [post]
func CreateQuiz(c *gin.Context) {
	var quiz models.Quiz
	if err := c.ShouldBindJSON(&quiz); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Dersin var olduğunu doğrula
	var lesson models.Lesson
	if err := database.DB.First(&lesson, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ders bulunamadı"})
		return
	}
	quiz.LessonID = lesson.ID
	database.DB.Create(&quiz)
	c.JSON(http.StatusCreated, quiz)
}

type SubmitAnswer struct {
	Answers map[string]string `json:"answers"` // question_id: "a"/"b"/"c"/"d"
}

// @Summary Quizi çöz ve gönder
// @Description Soruların cevaplarını gönderir, puanı hesaplar ve kaydeder
// @Tags quiz
// @Accept json
// @Produce json
// @Param id path int true "Quiz ID"
// @Param input body SubmitAnswer true "Cevaplar"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /quiz/{id}/submit [post]
func SubmitQuiz(c *gin.Context) {
	var input SubmitAnswer
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var quiz models.Quiz
	if err := database.DB.Preload("Questions").First(&quiz, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Quiz bulunamadı"})
		return
	}

	score := 0
	total := len(quiz.Questions)
	for _, q := range quiz.Questions {
		qID := fmt.Sprintf("%d", q.ID)
		if answer, ok := input.Answers[qID]; ok {
			if strings.EqualFold(answer, q.Correct) {
				score++
			}
		}
	}

	percent := 0.0
	if total > 0 {
		percent = float64(score) / float64(total) * 100
	}

	userID := c.GetUint("user_id")
	result := models.QuizResult{
		UserID:  userID,
		QuizID:  quiz.ID,
		Score:   score,
		Total:   total,
		Percent: percent,
	}
	database.DB.Create(&result)

	message := "Maalesef, tekrar deneyin."
	if percent >= 70 {
		message = "Tebrikler, geçtiniz!"
	}

	c.JSON(http.StatusOK, gin.H{
		"score":   score,
		"total":   total,
		"percent": percent,
		"message": message,
	})
}
