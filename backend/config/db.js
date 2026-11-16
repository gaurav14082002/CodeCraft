const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_learning_platform';
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn('⚠️  Make sure MongoDB is running on mongodb://127.0.0.1:27017');
    console.warn('   Start with: brew services start mongodb-community OR mongod --dbpath <data_dir>');
    return null;
  }
};

module.exports = connectDB;
