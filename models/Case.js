const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video', 'document'], required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  originalName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const caseSchema = new mongoose.Schema(
  {
    caseId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['missing_person', 'crime', 'harassment', 'scam', 'accident', 'corruption', 'other'],
      default: 'other',
    },
    status: { type: String, enum: ['open', 'resolved', 'unknown', 'archived'], default: 'open' },
    visibility: { type: String, enum: ['public', 'unlisted', 'private'], default: 'public' },
    location: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    media: [mediaSchema],
    commentCount: { type: Number, default: 0 },
    updateCount: { type: Number, default: 0 },
    isTrending: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Case = mongoose.model('Case', caseSchema);
module.exports = Case;
