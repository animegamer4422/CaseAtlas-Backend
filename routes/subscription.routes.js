const express = require('express');
const { subscribeToCase, unsubscribeFromCase, getMySubscriptions } = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

// For /api/users/me/subscriptions
router.get('/me/subscriptions', protect, getMySubscriptions);

// For /api/cases/:caseId/subscribe
router.post('/', protect, subscribeToCase);
router.delete('/', protect, unsubscribeFromCase);

module.exports = router;
