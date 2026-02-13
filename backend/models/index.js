const { sequelize } = require('../config/database');
const User = require('./User');
const Position = require('./Position');
const Application = require('./Application');

// Define Associations (Relasi antar tabel)

// User -> Applications (1 user bisa punya banyak applications)
User.hasMany(Application, {
  foreignKey: 'userId',
  as: 'applications'
});
Application.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Position -> Applications (1 posisi bisa punya banyak applications)
Position.hasMany(Application, {
  foreignKey: 'positionId',
  as: 'applications'
});
Application.belongsTo(Position, {
  foreignKey: 'positionId',
  as: 'position'
});

// User (admin) -> Applications reviewed (1 admin bisa review banyak applications)
User.hasMany(Application, {
  foreignKey: 'reviewedBy',
  as: 'reviewedApplications'
});
Application.belongsTo(User, {
  foreignKey: 'reviewedBy',
  as: 'reviewer'
});

// Sync semua models ke database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force }); // force: true akan drop semua tabel dan buat ulang (hati-hati!)
    console.log('✅ Database tables synchronized!');
  } catch (error) {
    console.error('❌ Error syncing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Position,
  Application,
  syncDatabase
};
