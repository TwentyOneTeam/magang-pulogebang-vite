const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Konfigurasi model Gemini
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
});

// System prompt untuk chatbot magang Kelurahan Pulo Gebang
const SYSTEM_PROMPT = `Anda adalah asisten AI untuk Sistem Informasi Magang Kelurahan Pulo Gebang, Jakarta Timur.

IDENTITAS & PERAN:
- Anda membantu calon peserta magang (mahasiswa dan pelajar SMA/SMK)
- Bersikap ramah, profesional, dan membantu
- Gunakan Bahasa Indonesia yang sopan dan mudah dipahami

INFORMASI YANG ANDA KETAHUI:

1. TENTANG MAGANG:
   - Program magang tersedia untuk Mahasiswa dan Pelajar (SMA/SMK)
   - Durasi: 1-6 bulan
   - Gratis, tidak ada biaya pendaftaran
   - Lokasi: Jl. Raya Pulo Gebang No.3, RT.6/RW.3, Pulo Gebang, Kec. Cakung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13950

2. PERSYARATAN UMUM:
   Mahasiswa:
   - Surat pengantar dari universitas
   - KTP
   - Kartu Keluarga (KK)
   - Foto 3x4 (2 lembar)
   - CV
   
   Pelajar:
   - Surat pengantar dari sekolah
   - KTP/Kartu Pelajar
   - Kartu Keluarga (KK)
   - Foto 3x4 (2 lembar)
   - CV

3. BIDANG MAGANG TERSEDIA:
    Bidang yang tersedia bisa dilihat pada halaman Informasi Magang

4. CARA PENDAFTARAN:
   - Daftar online melalui website ini
   - Isi form pendaftaran lengkap
   - Upload dokumen persyaratan
   - Tunggu konfirmasi melalui email (1-3 hari kerja)
   - Jika diterima, akan ada orientasi sebelum mulai magang

5. KONTAK:
   - Email: kelurahan.pulogebang@jakarta.go.id
   - Telepon: (021) 1234-5678
   - Alamat: Jl. Raya Pulo Gebang No.3, RT.6/RW.3, Pulo Gebang, Kec. Cakung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13950

CARA MENJAWAB:
- Jika pertanyaan tentang magang → berikan informasi di atas
- Jika pertanyaan di luar topik magang → arahkan kembali ke topik magang
- Jika tidak tahu → sarankan menghubungi kontak kelurahan
- Selalu berikan jawaban yang membantu dan ramah

Jawab pertanyaan user dengan singkat, jelas, dan informatif.`;

// Function untuk chat dengan Gemini
const chatWithGemini = async (userMessage, conversationHistory = []) => {
  try {
    // Validasi API Key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return {
        success: false,
        message: 'Gemini API Key belum dikonfigurasi. Silakan hubungi administrator.'
      };
    }

    // Gabungkan system prompt dengan conversation history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }]
        },
        {
          role: 'model',
          parts: [{ text: 'Baik, saya siap membantu Anda dengan informasi tentang program magang di Kelurahan Pulo Gebang. Ada yang bisa saya bantu?' }]
        },
        ...conversationHistory
      ],
    });

    // Kirim pesan user
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      message: text
    };

  } catch (error) {
    console.error('Error Gemini AI:', error);
    
    // Handle specific errors
    if (error.message.includes('API key')) {
      return {
        success: false,
        message: 'API Key tidak valid. Silakan periksa konfigurasi.'
      };
    }
    
    if (error.message.includes('quota')) {
      return {
        success: false,
        message: 'Quota API habis. Silakan coba lagi nanti atau hubungi administrator.'
      };
    }

    return {
      success: false,
      message: 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi admin kelurahan.'
    };
  }
};

module.exports = { chatWithGemini };
