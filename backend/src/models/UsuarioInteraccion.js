const mongoose = require('mongoose');

const usuarioInteraccionSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  prenda_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Prenda' }, // Puede ser nulo si interactúa con una Combinación
  combinacion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Combinacion' },
  tipo_interaccion: { 
    type: String, 
    enum: ['LIKE', 'DISLIKE', 'VIEW'], 
    required: true 
  },
  tiempo_visualizacion_ms: { type: Number, default: 0 },
  fecha_interaccion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario_Interaccion', usuarioInteraccionSchema);
