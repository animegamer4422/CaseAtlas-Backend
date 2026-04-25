const express = require('express');
const { createUpdate, getUpdates, approveUpdate } = require('../controllers/update.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true }); // mergeParams so we can use /api/cases/:caseId/updates

router.route('/')
  .post(protect, createUpdate)
  .get(getUpdates);

router.patch('/:updateId/approve', protect, approveUpdate);

module.exports = router;
