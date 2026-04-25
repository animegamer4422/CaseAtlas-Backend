const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/:notificationId/read', protect, markAsRead);

module.exports = router;
