const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video', 'document'], required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  originalName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const commentSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    media: [mediaSchema], // Array of media components for the comment
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    upvotes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
