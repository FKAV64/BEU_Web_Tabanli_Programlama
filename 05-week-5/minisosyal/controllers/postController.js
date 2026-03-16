const prisma = require('../config/prisma');

// GET /api/posts
exports.getPosts = async (req, res) => {
    try {
        const { search = '', page = 1, limit = 10 } = req.query;

        // Convert to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const where = search
            ? { content: { contains: search, mode: 'insensitive' } }
            : {};

        const [posts, totalPosts] = await Promise.all([
            prisma.post.findMany({
                where,
                take: limitNum,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { id: true, name: true, avatarUrl: true }
                    },
                    comments: {
                        include: {
                            author: { select: { id: true, name: true, avatarUrl: true } }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    _count: {
                        select: { likes: true, comments: true }
                    }
                }
            }),
            prisma.post.count({ where })
        ]);

        const totalPages = Math.ceil(totalPosts / limitNum);

        res.json({
            posts,
            pagination: {
                totalPosts,
                totalPages,
                currentPage: pageNum,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/posts
exports.createPost = async (req, res) => {
    try {
        const { content, imageUrl } = req.body;
        const authorId = req.user.userId;

        const newPost = await prisma.post.create({
            data: {
                content,
                imageUrl,
                authorId
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } }
            }
        });
        res.status(201).json(newPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.userId;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.authorId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'User not authorized to delete this post' });
        }

        // Delete related likes and comments first manually
        await prisma.comment.deleteMany({ where: { postId } });
        await prisma.like.deleteMany({ where: { postId } });

        // Delete the post
        await prisma.post.delete({ where: { id: postId } });

        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/posts/:id/like
exports.toggleLike = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.userId;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId
                }
            }
        });

        if (existingLike) {
            // Remove like
            await prisma.like.delete({
                where: { id: existingLike.id }
            });
            return res.json({ message: 'Post unliked', liked: false });
        } else {
            // Add like
            await prisma.like.create({
                data: {
                    userId,
                    postId
                }
            });
            return res.json({ message: 'Post liked', liked: true });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const authorId = req.user.userId;
        const { text } = req.body;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = await prisma.comment.create({
            data: {
                text,
                authorId,
                postId
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } }
            }
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.userId;
        const { content } = req.body;

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({ message: 'User not authorized to edit this post' });
        }

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { content },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
                comments: {
                    include: {
                        author: { select: { id: true, name: true, avatarUrl: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                _count: { select: { likes: true, comments: true } }
            }
        });

        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
