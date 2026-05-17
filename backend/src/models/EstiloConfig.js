const mongoose = require('mongoose');

const estiloConfigSchema = new mongoose.Schema({
  nombre_estilo: { type: String, required: true, unique: true }, // Ej: 'Grunge', 'Minimalista'
  descripcion: { type: String },
  reglas: {
    colores_permitidos: [{ type: String }],
    cortes_caracteristicos: [{ type: String }],
    prendas_clave: [{ type: String }] // IDs o Categorías
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Estilos_Config', estiloConfigSchema);
