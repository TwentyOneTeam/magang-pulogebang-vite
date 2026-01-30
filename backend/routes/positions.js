const express = require('express');
const router = express.Router();
const {
  getAllPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition,
  togglePositionActive
} = require('../controllers/positionController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { positionValidation, validate } = require('../middleware/validation');

// Public routes
router.get('/', getAllPositions);
router.get('/:id', getPositionById);

// Protected routes (admin only)
router.post('/', authenticate, authorizeAdmin, positionValidation, validate, createPosition);
router.put('/:id', authenticate, authorizeAdmin, positionValidation, validate, updatePosition);
router.delete('/:id', authenticate, authorizeAdmin, deletePosition);
router.patch('/:id/toggle-active', authenticate, authorizeAdmin, togglePositionActive);

module.exports = router;
