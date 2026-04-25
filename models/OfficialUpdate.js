const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video', 'document'], required: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  originalName: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const officialUpdateSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    media: [mediaSchema],
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const OfficialUpdate = mongoose.model('OfficialUpdate', officialUpdateSchema);
module.exports = OfficialUpdate;
