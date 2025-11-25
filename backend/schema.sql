-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: applications
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    applicant_type VARCHAR(20) NOT NULL, -- mahasiswa or pelajar
    full_name VARCHAR(255) NOT NULL,
    npm VARCHAR(50), -- NPM/NIM for mahasiswa, NIS for pelajar
    institution VARCHAR(255), -- University for mahasiswa, School for pelajar
    school_type VARCHAR(50), -- SMA/SMK for pelajar
    major VARCHAR(255), -- Program Studi for mahasiswa, Jurusan/Kelas for pelajar
    grade VARCHAR(10), -- Kelas for pelajar
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    start_date DATE,
    division VARCHAR(255),
    duration VARCHAR(50),
    address TEXT,
    file_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: internship_positions
CREATE TABLE IF NOT EXISTS internship_positions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    division VARCHAR(255) NOT NULL,
    quota INTEGER NOT NULL,
    period VARCHAR(50),
    requirements TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
