package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email" gorm:"uniqueIndex"`
	Password string `json:"-"`
	Role     string `json:"role" gorm:"default:student"` // "teacher" veya "student"
}
