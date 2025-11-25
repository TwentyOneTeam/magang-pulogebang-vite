import { Router } from 'express';
import { pool } from './index';

const router = Router();

// Registration endpoint
router.post('/register', async (req, res) => {
  const {
    applicantType,
    fullName,
    npm,
    institution,
    schoolType,
    major,
    grade,
    email,
    phone,
    startDate,
    division,
    duration,
    address,
    fileUrl,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO applications (
        applicant_type, full_name, npm, institution, school_type, major, grade, email, phone, start_date, division, duration, address, file_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [
        applicantType,
        fullName,
        npm,
        institution,
        schoolType,
        major,
        grade,
        email,
        phone,
        startDate,
        division,
        duration,
        address,
        fileUrl,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register application', details: err });
  }
});

// Get all applications (admin)
router.get('/applications', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM applications ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications', details: err });
  }
});

// Get application status by email
router.get('/status', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const result = await pool.query('SELECT * FROM applications WHERE email = $1 ORDER BY created_at DESC', [email]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status', details: err });
  }
});

export default router;
