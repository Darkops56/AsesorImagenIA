const mongoose = require('mongoose');

const prendaSchema = new mongoose.Schema({
  id_prenda: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  categoria: { type: String, required: true }, // Superior, Inferior, Calzado, Accesorio
  atributos_diseno: {
    tipo_cuello: { type: String },
    volumen: { type: String },
    corte: { type: String },
    tiro: { type: String } // Para pantalones
  },
  tags_compatibilidad: [{ type: String }], // ej: ['Reloj de Arena', 'Triángulo Invertido']
  siluetas_compatibles: [{ type: String }], // Nuevo campo para match IA
  metadata: {
    color_dominante: { type: String },
    url_imagen: { type: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Prenda', prendaSchema);
