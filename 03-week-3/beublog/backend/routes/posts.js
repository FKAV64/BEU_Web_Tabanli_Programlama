const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts - Get all posts (Public) 
router.get('/', async (req, res) => {
  try {
    // We use .populate() to get the actual User and Category data, not just their IDs
    const posts = await Post.find()
      .populate('author', 'username')
      .populate('category', 'name slug');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// GET /api/posts/by-slug/:slug - Get a single post by its URL slug (Public) [cite: 152, 153]
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate('author', 'username')
      .populate('category', 'name slug');
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// POST /api/posts - Create a new post (Protected, requires login) 
router.post('/', protect, async (req, res) => {
  try {
    const { title, slug, content, category, image } = req.body;
    
    const post = new Post({
      title,
      slug,
      content,
      category,
      image,
      author: req.user.id // This comes from our JWT middleware!
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

module.exports = router;

// PUT /api/posts/:id - Yazı güncelle (Update post) [cite: 154]
router.put('/:id', protect, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Ensure the user updating is the author (or an admin)
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to edit this post' });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error updating post' });
  }
});

// DELETE /api/posts/:id - Yazı sil (Delete post) [cite: 155]
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Ensure the user deleting is the author or an admin
    if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// PUT /api/posts/:id/like - Yazıyı beğen (Like/Unlike post) [cite: 156]
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if the post has already been liked by this user
    const likeIndex = post.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      post.likes.push(req.user.id); // Like
    } else {
      post.likes.splice(likeIndex, 1); // Unlike
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ message: 'Error liking post' });
  }
});

// PUT /api/posts/:id/status - Yazı durumunu değiştir (Admin only moderation) [cite: 157]
const { adminOnly } = require('../middleware/auth'); // Ensure you import adminOnly at the top!

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error updating post status' });
  }
});