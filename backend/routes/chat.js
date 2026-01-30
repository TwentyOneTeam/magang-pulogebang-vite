const express = require('express');
const router = express.Router();
const { chat, testGemini } = require('../controllers/chatController');

// Public routes (chatbot bisa diakses tanpa login)
router.post('/', chat);
router.get('/test', testGemini);

module.exports = router;
