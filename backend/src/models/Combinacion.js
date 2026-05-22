const mongoose = require('mongoose');

const combinacionSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  prenda_superior_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prenda', required: true },
  prenda_inferior_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prenda', required: true },
  fecha_creacion: { type: Date, default: Date.now },
  // Keeping optional previous fields in case they are needed later
  nombre: { type: String },
  estilo_base: { type: String },
  generada_por_ia: { type: Boolean, default: true },
  activa: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Combinacion', combinacionSchema);
