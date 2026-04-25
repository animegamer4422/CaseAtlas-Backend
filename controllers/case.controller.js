const Case = require('../models/Case');
const User = require('../models/User');
const generateCaseId = require('../utils/generateCaseId');

// Create a new case
const createCase = async (req, res) => {
  try {
    const { title, description, category, location, media, visibility } = req.body;

    const newCase = await Case.create({
      caseId: generateCaseId(),
      title,
      description,
      category,
      location,
      visibility: visibility || 'public',
      createdBy: req.user._id,
      moderators: [req.user._id],
      media: media || [],
    });

    // Add to user's created cases
    await User.findByIdAndUpdate(req.user._id, {
      $push: { createdCases: newCase._id },
    });

    res.status(201).json(newCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all cases
const getCases = async (req, res) => {
  try {
    const cases = await Case.find()
      .populate('createdBy', 'username avatarInitials avatarColor')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get case by ID (using the custom caseId e.g., CA-XXXX-XXXX)
const getCaseById = async (req, res) => {
  try {
    const caseItem = await Case.findOne({ caseId: req.params.caseId })
      .populate('createdBy', 'username avatarInitials avatarColor')
      .populate('moderators', 'username')
      .populate('subscribers', 'username');

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update case details
const updateCase = async (req, res) => {
  try {
    const caseItem = await Case.findOne({ caseId: req.params.caseId });

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Check if user is a moderator or admin
    if (!caseItem.moderators.includes(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this case' });
    }

    const { title, description, category, status, location, visibility } = req.body;

    caseItem.title = title || caseItem.title;
    caseItem.description = description || caseItem.description;
    caseItem.category = category || caseItem.category;
    caseItem.status = status || caseItem.status;
    caseItem.location = location || caseItem.location;
    caseItem.visibility = visibility || caseItem.visibility;

    const updatedCase = await caseItem.save();
    res.json(updatedCase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a case
const deleteCase = async (req, res) => {
  try {
    const caseItem = await Case.findOne({ caseId: req.params.caseId });

    if (!caseItem) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Check if user is the creator or admin
    if (caseItem.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this case' });
    }

    await Case.deleteOne({ caseId: req.params.caseId });
    res.json({ message: 'Case removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCase, getCases, getCaseById, updateCase, deleteCase };
