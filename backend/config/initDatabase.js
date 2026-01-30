/**
 * Script untuk inisialisasi database
 * - Create tables
 * - Create default admin user
 * - Create sample positions
 * 
 * Jalankan dengan: npm run init-db
 */

const bcrypt = require('bcryptjs');
require('dotenv').config();

const { testConnection, sequelize } = require('./database');
const { User, Position, syncDatabase } = require('../models');

const initDatabase = async () => {
  try {
    console.log('\n🚀 Starting database initialization...\n');

    // Test connection
    console.log('1️⃣  Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Cannot proceed without database connection');
      process.exit(1);
    }

    // Sync database (create all tables)
    console.log('\n2️⃣  Creating database tables...');
    await syncDatabase(false); // false = tidak drop existing tables
    console.log('✅ Tables created successfully!');

    // Create default admin user
    console.log('\n3️⃣  Creating default admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pulogebang.go.id';
    
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${adminEmail}`);
    } else {
      await User.create({
        name: process.env.ADMIN_NAME || 'Administrator Kelurahan',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin123!',
        role: 'admin',
        phone: '(021) 1234-5678',
        isActive: true,
        isVerified: true, // Admin langsung verified
        otpCode: null,
        otpExpiresAt: null,
        resetOtp: null,
        resetOtpExpiresAt: null
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
      console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'Admin123!'}`);
      console.log('   ⚠️  PENTING: Segera ubah password setelah login pertama kali!');
    }

    // Create sample positions
    console.log('\n4️⃣  Creating sample positions...');
    
    const samplePositions = [
      {
        title: 'Staff Administrasi Umum',
        department: 'Administrasi',
        description: 'Membantu kegiatan administrasi dan pelayanan masyarakat di Kelurahan Pulo Gebang',
        requirements: `- Mahasiswa semester 4 ke atas atau Pelajar kelas 11-12
- Menguasai Microsoft Office (Word, Excel)
- Teliti dan bertanggung jawab
- Mampu berkomunikasi dengan baik`,
        quota: 3,
        duration: '1-3 bulan',
        applicantType: 'both',
        isActive: true
      },
      {
        title: 'IT Support & Website Management',
        department: 'IT & Sistem Informasi',
        description: 'Membantu maintenance website kelurahan dan troubleshooting komputer',
        requirements: `- Mahasiswa Teknik Informatika/Sistem Informasi atau Pelajar SMK Jurusan TKJ/RPL
- Memahami dasar HTML, CSS, JavaScript
- Memahami troubleshooting komputer
- Mampu bekerja dalam tim`,
        quota: 2,
        duration: '2-3 bulan',
        applicantType: 'both',
        isActive: true
      },
      {
        title: 'Pelayanan Publik',
        department: 'Pelayanan Masyarakat',
        description: 'Membantu melayani masyarakat dalam pengurusan administrasi kependudukan',
        requirements: `- Mahasiswa atau Pelajar
- Ramah dan komunikatif
- Sabar dalam melayani masyarakat
- Berpenampilan rapi`,
        quota: 4,
        duration: '1-2 bulan',
        applicantType: 'both',
        isActive: true
      },
      {
        title: 'Administrasi Keuangan',
        department: 'Keuangan',
        description: 'Membantu pencatatan dan administrasi keuangan kelurahan',
        requirements: `- Mahasiswa Akuntansi/Manajemen atau Pelajar SMK Akuntansi
- Teliti dan jujur
- Menguasai Microsoft Excel
- Memahami dasar-dasar akuntansi`,
        quota: 2,
        duration: '2-3 bulan',
        applicantType: 'both',
        isActive: true
      },
      {
        title: 'Social Media Officer',
        department: 'Humas',
        description: 'Mengelola media sosial dan dokumentasi kegiatan kelurahan',
        requirements: `- Mahasiswa Komunikasi/DKV atau Pelajar
- Kreatif dan update dengan tren media sosial
- Mampu membuat konten menarik
- Menguasai desain grafis (Canva/Photoshop) nilai plus`,
        quota: 2,
        duration: '1-3 bulan',
        applicantType: 'both',
        isActive: true
      }
    ];

    for (const positionData of samplePositions) {
      const existing = await Position.findOne({ 
        where: { 
          title: positionData.title 
        } 
      });
      
      if (!existing) {
        await Position.create(positionData);
        console.log(`   ✅ Created position: ${positionData.title}`);
      } else {
        console.log(`   ⚠️  Position already exists: ${positionData.title}`);
      }
    }

    console.log('\n✅ Database initialization completed successfully!');
    console.log('\n📝 Summary:');
    console.log(`   - Admin Email: ${adminEmail}`);
    console.log(`   - Admin Password: ${process.env.ADMIN_PASSWORD || 'Admin123!'}`);
    console.log(`   - Sample Positions: ${samplePositions.length} positions created`);
    console.log('\n🚀 You can now start the server with: npm run dev\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during database initialization:', error);
    process.exit(1);
  }
};

// Run initialization
initDatabase();
