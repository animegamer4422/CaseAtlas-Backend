const Comment = require('../models/Comment');
const Case = require('../models/Case');
const { getIo } = require('../sockets/socket');

// Create comment
const createComment = async (req, res) => {
  try {
    const { content, parentComment, media } = req.body;
    const caseItem = await Case.findOne({ caseId: req.params.caseId });

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const comment = await Comment.create({
      caseId: caseItem._id,
      userId: req.user._id,
      content,
      media: media || [],
      parentComment: parentComment || null,
    });

    caseItem.commentCount += 1;
    await caseItem.save();

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'username avatarInitials');

    const io = getIo();
    if (io) {
      io.to(req.params.caseId).emit('new_comment', populatedComment);
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a case
const getComments = async (req, res) => {
  try {
    const caseItem = await Case.findOne({ caseId: req.params.caseId });
    if (!caseItem) return res.status(404).json({ message: 'Case not found' });

    const comments = await Comment.find({ caseId: caseItem._id })
      .populate('userId', 'username avatarInitials')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Comment.deleteOne({ _id: req.params.commentId });

    // Decrement count
    const caseItem = await Case.findById(comment.caseId);
    if (caseItem) {
        caseItem.commentCount = Math.max(0, caseItem.commentCount - 1);
        await caseItem.save();
    }

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createComment, getComments, deleteComment };
