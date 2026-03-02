const express = require('express');
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth'); // Import our security checks

const router = express.Router();

// GET /api/categories - Get all categories (Public) [cite: 160]
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// POST /api/categories - Create a new category (Admin only) [cite: 161, 162]
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    const category = new Category({ name, slug, description });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Error creating category' });
  }
});

// DELETE /api/categories/:id - Delete a category (Admin only) [cite: 163, 164]
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

module.exports = router;