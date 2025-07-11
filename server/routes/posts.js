const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { auth, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const { postImageStorage } = require('../utils/cloudinary');

const router = express.Router();

// Configure multer for Cloudinary uploads
const upload = multer({ 
  storage: postImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Get all posts (with pagination and filters)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || '';
    const category = req.query.category || '';
    const search = req.query.search || '';
    const author = req.query.author || '';

    const query = { isPublic: true };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar university major')
      .populate('comments')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments(query);

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.likes.includes(req.user._id);
      });
    }

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Explore posts (for discovery)
router.get('/explore', optionalAuth, async (req, res) => {
  try {
    const search = req.query.search || '';
    const type = req.query.type || '';
    const limit = parseInt(req.query.limit) || 20;

    const query = { isPublic: true };
    
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar university major')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.likes.includes(req.user._id);
      });
    }

    res.json({ posts });
  } catch (error) {
    console.error('Explore posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get liked posts for current user
router.get('/liked', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find({ 
      likes: req.user._id,
      isPublic: true 
    })
      .populate('author', 'username fullName avatar university major')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments({ 
      likes: req.user._id,
      isPublic: true 
    });

    // Add like status
    posts.forEach(post => {
      post.isLiked = true;
    });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get liked posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single post by ID
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate('author', 'username fullName avatar university major')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username fullName avatar'
        }
      });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    // Add like status for authenticated users
    if (req.user) {
      post.isLiked = post.likes.includes(req.user._id);
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new post
router.post('/', auth, upload.array('attachments', 5), [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('content').notEmpty().withMessage('Content is required').isLength({ max: 5000 }),
  body('type').isIn(['note', 'job']).withMessage('Type must be either note or job'),
  body('category').isIn(['academic', 'project', 'research', 'study-guide', 'tutorial', 'internship', 'part-time', 'full-time', 'freelance', 'research-assistant', 'other']).withMessage('Invalid category'),
  body('tags').optional().isString(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      type,
      category,
      tags,
      isPublic,
      jobDetails,
      noteDetails
    } = req.body;

    // Parse tags if provided as string
    let parsedTags = [];
    if (tags) {
      parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    // Handle file attachments - Cloudinary URLs
    const attachments = req.files ? req.files.map(file => file.path) : [];

    const post = new Post({
      author: req.user._id,
      title,
      content,
      type,
      category,
      tags: parsedTags,
      attachments,
      isPublic: isPublic !== undefined ? isPublic : true,
      jobDetails: type === 'job' ? jobDetails : undefined,
      noteDetails: type === 'note' ? noteDetails : undefined
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username fullName avatar university major');

    res.status(201).json({
      message: 'Post created successfully',
      post: populatedPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update post
router.put('/:postId', auth, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').isLength({ max: 200 }),
  body('content').optional().notEmpty().withMessage('Content cannot be empty').isLength({ max: 5000 }),
  body('category').optional().isIn(['academic', 'project', 'research', 'study-guide', 'tutorial', 'internship', 'part-time', 'full-time', 'freelance', 'research-assistant', 'other']),
  body('tags').optional().isString(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updateFields = {};
    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.content) updateFields.content = req.body.content;
    if (req.body.category) updateFields.category = req.body.category;
    if (req.body.isPublic !== undefined) updateFields.isPublic = req.body.isPublic;
    if (req.body.jobDetails) updateFields.jobDetails = req.body.jobDetails;
    if (req.body.noteDetails) updateFields.noteDetails = req.body.noteDetails;

    // Parse tags if provided
    if (req.body.tags) {
      updateFields.tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      updateFields,
      { new: true, runValidators: true }
    ).populate('author', 'username fullName avatar university major');

    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:postId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated comments
    await Comment.deleteMany({ post: req.params.postId });

    // Delete the post
    await Post.findByIdAndDelete(req.params.postId);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(req.params.postId, {
        $pull: { likes: req.user._id }
      });
      res.json({ message: 'Post unliked successfully', liked: false });
    } else {
      // Like
      await Post.findByIdAndUpdate(req.params.postId, {
        $push: { likes: req.user._id }
      });
      res.json({ message: 'Post liked successfully', liked: true });
    }
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's posts
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const type = req.query.type || '';

    const query = { author: req.params.userId };
    if (type) query.type = type;

    // Only show public posts unless viewing own posts
    if (!req.user || req.params.userId !== req.user._id.toString()) {
      query.isPublic = true;
    }

    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar university major')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments(query);

    // Add like status for authenticated users
    if (req.user) {
      posts.forEach(post => {
        post.isLiked = post.likes.includes(req.user._id);
      });
    }

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get comments for a post
router.get('/:postId/comments', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const comments = await Comment.find({ 
      post: req.params.postId,
      parentComment: null // Only top-level comments
    })
      .populate('author', 'username fullName avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username fullName avatar'
        }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Comment.countDocuments({ 
      post: req.params.postId,
      parentComment: null
    });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create comment for a post
router.post('/:postId/comments', auth, [
  body('content').notEmpty().withMessage('Comment content is required').isLength({ max: 1000 }),
  body('parentCommentId').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content, parentCommentId } = req.body;

    // Check if post exists
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If this is a reply, check if parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = new Comment({
      author: req.user._id,
      post: req.params.postId,
      content,
      parentComment: parentCommentId || null
    });

    await comment.save();

    // If this is a reply, add it to parent comment's replies
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $push: { replies: comment._id }
      });
    }

    // Add comment to post's comments array
    await Post.findByIdAndUpdate(req.params.postId, {
      $push: { comments: comment._id }
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username fullName avatar');

    res.status(201).json({
      message: 'Comment created successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove comment from post's comments array
    await Post.findByIdAndUpdate(req.params.postId, {
      $pull: { comments: req.params.commentId }
    });

    // If this is a reply, remove it from parent comment's replies
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: req.params.commentId }
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: req.params.commentId });

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.commentId);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 