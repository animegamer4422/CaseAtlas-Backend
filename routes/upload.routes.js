const express = require('express');
const { uploadMedia } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.post('/case-media', protect, upload.array('media', 10), uploadMedia);
router.post('/update-media', protect, upload.array('media', 10), uploadMedia);
router.post('/comment-media', protect, upload.array('media', 5), uploadMedia);

module.exports = router;
