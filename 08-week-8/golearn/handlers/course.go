package handlers

import (
	"golearn/database"
	"golearn/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// @Summary Tüm kursları listele
// @Description Sayfalama, kategori filtreleme ve sıralama ile kursları getirir
// @Tags courses
// @Produce json
// @Param page query int false "Sayfa numarası (default 1)"
// @Param limit query int false "Sayfa başına limit (default 10)"
// @Param category query string false "Kategori filtreleme"
// @Param sort query string false "Sıralama (örnek: title asc)"
// @Success 200 {object} map[string]interface{}
// @Router /courses [get]
func GetCourses(c *gin.Context) {
	var courses []models.Course
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	category := c.Query("category")
	sort := c.DefaultQuery("sort", "created_at desc")
	offset := (page - 1) * limit

	query := database.DB.Preload("Teacher")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var total int64
	query.Model(&models.Course{}).Count(&total)

	query.Order(sort).Offset(offset).Limit(limit).Find(&courses)
	c.JSON(http.StatusOK, gin.H{
		"data":  courses,
		"page":  page,
		"limit": limit,
		"total": total,
	})
}

// @Summary Kurs detaylarını getir
// @Description ID bazlı kurs detayı ve içindeki dersleri getirir
// @Tags courses
// @Produce json
// @Param id path int true "Kurs ID"
// @Success 200 {object} models.Course
// @Failure 404 {object} map[string]string
// @Router /courses/{id} [get]
func GetCourse(c *gin.Context) {
	var course models.Course
	if err := database.DB.Preload("Teacher").Preload("Lessons").First(&course, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kurs bulunamadı"})
		return
	}
	c.JSON(http.StatusOK, course)
}

// @Summary Yeni kurs oluştur
// @Description Öğretmen rolüne sahip kullanıcı yeni kurs oluşturur
// @Tags courses
// @Accept json
// @Produce json
// @Param course body models.Course true "Kurs bilgileri"
// @Success 201 {object} models.Course
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Security BearerAuth
// @Router /courses [post]
func CreateCourse(c *gin.Context) {
	var course models.Course
	if err := c.ShouldBindJSON(&course); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := c.GetUint("user_id")
	course.TeacherID = userID
	database.DB.Create(&course)
	c.JSON(http.StatusCreated, course)
}

// @Summary Kursu güncelle
// @Description Sadece kursun sahibi olan öğretmen kursu güncelleyebilir
// @Tags courses
// @Accept json
// @Produce json
// @Param id path int true "Kurs ID"
// @Param course body models.Course true "Yeni kurs bilgileri"
// @Success 200 {object} models.Course
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /courses/{id} [put]
func UpdateCourse(c *gin.Context) {
	var course models.Course
	if err := database.DB.First(&course, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kurs bulunamadı"})
		return
	}
	userID := c.GetUint("user_id")
	if course.TeacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Bu kursu sadece sahibi düzenleyebilir"})
		return
	}
	c.ShouldBindJSON(&course)
	database.DB.Save(&course)
	c.JSON(http.StatusOK, course)
}

// @Summary Kursu sil
// @Description Sadece kursun sahibi olan öğretmen kursu silebilir
// @Tags courses
// @Param id path int true "Kurs ID"
// @Success 200 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /courses/{id} [delete]
func DeleteCourse(c *gin.Context) {
	var course models.Course
	if err := database.DB.First(&course, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kurs bulunamadı"})
		return
	}
	userID := c.GetUint("user_id")
	if course.TeacherID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Bu kursu sadece sahibi silebilir"})
		return
	}
	database.DB.Delete(&course)
	c.JSON(http.StatusOK, gin.H{"message": "Kurs silindi"})
}
