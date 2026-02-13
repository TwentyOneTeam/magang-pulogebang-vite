const express = require('express');
const router = express.Router();
const {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationStats
} = require('../controllers/applicationController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const {
  applicationValidation,
  updateStatusValidation,
  validate
} = require('../middleware/validation');
const {
  uploadApplicationFiles,
  handleMulterError
} = require('../middleware/upload');

// Protected routes - Stats (admin only) - MUST be before general routes
router.get('/stats', authenticate, authorizeAdmin, getApplicationStats);

// Protected routes - Applications
router.get('/', authenticate, getAllApplications);
router.get('/:id', authenticate, getApplicationById);
router.delete('/:id', authenticate, deleteApplication);

router.post(
  '/',
  authenticate,
  uploadApplicationFiles,
  handleMulterError,
  applicationValidation,
  validate,
  createApplication
);

// Admin only routes
router.put(
  '/:id/status',
  authenticate,
  authorizeAdmin,
  updateStatusValidation,
  validate,
  updateApplicationStatus
);

module.exports = router;
