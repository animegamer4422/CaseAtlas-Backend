const express = require('express');
const { createCase, getCases, getCaseById, updateCase, deleteCase } = require('../controllers/case.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.route('/')
  .post(protect, createCase)
  .get(getCases);

router.route('/:caseId')
  .get(getCaseById)
  .patch(protect, updateCase)
  .delete(protect, deleteCase);

module.exports = router;
