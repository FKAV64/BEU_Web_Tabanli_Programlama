const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 1. Configure where and how files are stored
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Save to the uploads folder
  },
  filename: function (req, file, cb) {
    // Create a unique filename using the current timestamp
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// 2. Filter for allowed image types (JPEG, PNG, GIF, WebP, SVG)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Sadece desteklenen görsel formatları (JPEG, PNG, GIF, WebP, SVG) yüklenebilir!'));
  }
};

// 3. Initialize Multer with a 10MB limit
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit in bytes
  fileFilter
});

// POST /api/upload - Upload an image (Protected)
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return the URL path to the frontend so it can display the image
  res.status(200).json({
    message: 'Görsel başarıyla yüklendi',
    imageUrl: `/uploads/${req.file.filename}`
  });
});

module.exports = router;