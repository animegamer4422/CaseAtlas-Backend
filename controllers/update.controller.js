const OfficialUpdate = require('../models/OfficialUpdate');
const Case = require('../models/Case');
const createNotification = require('../utils/createNotification');
const { getIo } = require('../sockets/socket');

// Create official update
const createUpdate = async (req, res) => {
  try {
    const { title, content, media } = req.body;
    const caseItem = await Case.findOne({ caseId: req.params.caseId });

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Must be moderator or admin
    if (!caseItem.moderators.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to post official updates' });
    }

    // If active moderator, auto-approve
    const isApproved = caseItem.moderators.includes(req.user._id) || req.user.role === 'admin';

    const update = await OfficialUpdate.create({
      caseId: caseItem._id,
      title,
      content,
      media: media || [],
      postedBy: req.user._id,
      isApproved,
      approvedBy: isApproved ? req.user._id : null,
    });

    if (isApproved) {
      caseItem.updateCount += 1;
      await caseItem.save();

      // Emit realtime update to all connected in case room
      const io = getIo();
      if (io) {
        io.to(req.params.caseId).emit('case_update', {
          caseId: req.params.caseId,
          title: 'New verified update',
          message: title,
        });
      }

      // Send to all subscribers via Notification Model
      for (const subId of caseItem.subscribers) {
        if (subId.toString() !== req.user._id.toString()) {
          await createNotification(subId, caseItem._id, 'case_update', `A new official update was posted: ${title}`);
        }
      }
    }

    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get updates for a case
const getUpdates = async (req, res) => {
  try {
    const caseItem = await Case.findOne({ caseId: req.params.caseId });
    if (!caseItem) return res.status(404).json({ message: 'Case not found' });

    // Only show approved updates (unless you are a mod)
    let query = { caseId: caseItem._id };
    if (!req.user || (!caseItem.moderators.includes(req.user._id) && req.user?.role !== 'admin')) {
      query.isApproved = true;
    }

    const updates = await OfficialUpdate.find(query)
      .populate('postedBy', 'username avatarInitials')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveUpdate = async (req, res) => {
  try {
    const update = await OfficialUpdate.findById(req.params.updateId).populate('caseId');
    if (!update) return res.status(404).json({ message: 'Update not found' });

    const caseItem = await Case.findById(update.caseId._id);
    if (!caseItem.moderators.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    update.isApproved = true;
    update.approvedBy = req.user._id;
    await update.save();

    caseItem.updateCount += 1;
    await caseItem.save();

    res.json(update);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUpdate, getUpdates, approveUpdate };
