const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create and save the new user
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  //} catch (err) {
    //res.status(500).json({ message: 'Server error during registration' });
  //}
  } catch (err) {
    console.error("Kayıt Hatası (Registration Error):", err); // Add this line!
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /api/auth/login - Authenticate user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare the provided password with the hashed database password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Generate the JWT
    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email, role: user.role } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

const { protect } = require('../middleware/auth');
const Post = require('../models/Post'); // Import Post model to fetch user's posts

// GET /api/auth/me - Mevcut kullanıcı bilgisi (Get current user) [cite: 139, 140]
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Don't return the password hash
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/me/profile - Profil güncelleme (Update profile) [cite: 141, 142]
router.put('/me/profile', protect, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, email },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// PUT /api/auth/me/password - Parola değiştirme (Change password) [cite: 143, 144]
router.put('/me/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mevcut parola yanlış (Current password incorrect)' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Parola başarıyla güncellendi (Password updated successfully)' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating password' });
  }
});

// GET /api/auth/me/posts - Kullanıcının yazıları (Get user's posts) [cite: 145, 146]
router.get('/me/posts', protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id }).populate('category', 'name slug');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user posts' });
  }
});

module.exports = router;