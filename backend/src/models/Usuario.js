const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  phone: { type: String },
  medidas_morfometricas: {
    S: { type: Number, default: null }, // Shoulders
    W: { type: Number, default: null }, // Waist
    H: { type: Number, default: null }  // Hips
  },
  silueta_detectada: {
    type: String,
    enum: ['Triángulo', 'Triángulo Invertido', 'Reloj de Arena', 'Rectángulo', 'Óvalo', null],
    default: null
  },
  biometria_activada: { type: Boolean, default: false },
  fecha_registro: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);
