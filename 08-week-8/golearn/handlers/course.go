package handlers

import (
	"golearn/database"
	"golearn/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

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

func GetCourse(c *gin.Context) {
	var course models.Course
	if err := database.DB.Preload("Teacher").Preload("Lessons").First(&course, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kurs bulunamadı"})
		return
	}
	c.JSON(http.StatusOK, course)
}

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
