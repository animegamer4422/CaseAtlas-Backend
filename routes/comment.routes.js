const express = require('express');
const { createComment, getComments, deleteComment } = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(protect, createComment)
  .get(getComments);

// We define deleteComment logic at /api/comments/:commentId instead of nesting inside case
router.delete('/:commentId', protect, deleteComment);

module.exports = router;
