const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { authMiddleware } = require('../utils/auth');

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const author = req.user?.name || req.body.author || 'Anonymous'
    const post = new Post({ title, content, author });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all posts, with optional sort
router.get('/', async (req, res) => {
  try {
    const sort = req.query.sort === 'votes' ? { votes: -1 } : { createdAt: -1 };
    const posts = await Post.find().sort(sort).lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add reply
router.post('/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const author = req.user?.name || req.body.author || 'Anonymous'
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.replies.push({ content, author });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a reply
router.patch('/:id/reply/:replyId', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const reply = post.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    // ownership check: prefer authenticated user, otherwise allow if provided author matches
    const requester = req.user?.name || req.body.author;
    if (!requester || requester !== reply.author) {
      return res.status(403).json({ error: 'Not authorized to edit this reply' });
    }

    reply.content = content;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a reply
router.delete('/:id/reply/:replyId', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const reply = post.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ error: 'Reply not found' });

    const requester = req.user?.name || req.body.author;
    if (!requester || requester !== reply.author) {
      return res.status(403).json({ error: 'Not authorized to delete this reply' });
    }

    reply.remove();
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upvote
router.post('/:id/upvote', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 } }, { new: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark answered
router.post('/:id/answered', async (req, res) => {
  try {
    const { answered } = req.body;
    const post = await Post.findByIdAndUpdate(req.params.id, { answered: !!answered }, { new: true });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const requester = req.user?.name || req.body.author;
    if (!requester || requester !== post.author) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await post.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
