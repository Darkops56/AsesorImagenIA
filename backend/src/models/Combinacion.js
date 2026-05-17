const mongoose = require('mongoose');

const combinacionSchema = new mongoose.Schema({
  nombre: { type: String },
  estilo_base: { type: String },
  prendas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prenda' }], // Lista de prendas que forman el outfit
  generada_por_ia: { type: Boolean, default: false }, // Para distinguir outfits pre-armados de dinámicos
  usuario_creador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, // Si el usuario fue quien armo el outfit
  activa: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Combinacion', combinacionSchema);
