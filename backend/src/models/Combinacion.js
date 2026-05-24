const mongoose = require('mongoose');

const combinacionSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  prendas_base: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prenda' }],
  prendas_outer: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prenda' }],
  prenda_inferior: { type: mongoose.Schema.Types.ObjectId, ref: 'Prenda' },
  calzado: { type: mongoose.Schema.Types.ObjectId, ref: 'Prenda' },
  accesorios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Prenda' }],
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
