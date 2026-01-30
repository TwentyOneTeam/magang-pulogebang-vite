const { chatWithGemini } = require('../config/gemini');

// @desc    Chat with Gemini AI
// @route   POST /api/chat
// @access  Public
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Pesan tidak boleh kosong'
      });
    }

    // Format conversation history untuk Gemini
    const formattedHistory = [];
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'model') {
          formattedHistory.push({
            role: msg.role,
            parts: [{ text: msg.text }]
          });
        }
      });
    }

    // Chat dengan Gemini
    const result = await chatWithGemini(message, formattedHistory);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message
      });
    }

    res.json({
      success: true,
      data: {
        response: result.message,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memproses chat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Test Gemini connection
// @route   GET /api/chat/test
// @access  Public
exports.testGemini = async (req, res) => {
  try {
    const result = await chatWithGemini('Halo, perkenalkan dirimu!');

    res.json({
      success: result.success,
      message: result.success ? 'Gemini AI terhubung dengan baik' : 'Gagal terhubung ke Gemini AI',
      response: result.message
    });

  } catch (error) {
    console.error('Test Gemini error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal melakukan test koneksi Gemini',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};