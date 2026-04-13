package models

import "gorm.io/gorm"

type Course struct {
	gorm.Model
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	TeacherID   uint     `json:"teacher_id"`
	Teacher     User     `json:"teacher" gorm:"foreignKey:TeacherID"`
	Lessons     []Lesson `json:"lessons,omitempty" gorm:"foreignKey:CourseID"`
}
