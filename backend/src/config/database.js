const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = /*process.env.MONGO_URI ||*/ 'mongodb://localhost:27017/';
    
    await mongoose.connect(mongoURI);
    
    console.log('📦 MongoDB conectado exitosamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1); // Detener la app si no hay BD
  }
};

module.exports = connectDB;
