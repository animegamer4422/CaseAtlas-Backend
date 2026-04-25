const express = require('express');
const { searchCases } = require('../controllers/search.controller');

const router = express.Router();

router.get('/', searchCases);
router.get('/cases', searchCases);

module.exports = router;
