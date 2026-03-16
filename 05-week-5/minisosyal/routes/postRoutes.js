const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authGuard = require('../middleware/authGuard');

// GET /api/posts: Fetch feed ordered by createdAt desc
router.get('/', postController.getPosts);

// POST /api/posts: Create a new post
router.post('/', authGuard, postController.createPost);

// PUT /api/posts/:id: Update a post
router.put('/:id', authGuard, postController.updatePost);

// DELETE /api/posts/:id: Delete a post
router.delete('/:id', authGuard, postController.deletePost);

// POST /api/posts/:id/like: Toggle a like on a post
router.post('/:id/like', authGuard, postController.toggleLike);

// POST /api/posts/:id/comments: Add a comment to a post
router.post('/:id/comments', authGuard, postController.addComment);

module.exports = router;
