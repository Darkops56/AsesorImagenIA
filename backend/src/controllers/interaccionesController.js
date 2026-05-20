const UsuarioInteraccion = require('../models/UsuarioInteraccion');
const mongoose = require('mongoose');

// Registrar una nueva interacción
exports.registrarInteraccion = async (req, res) => {
  try {
    const { usuario_id, prenda_id, tipo_interaccion, tiempo_visualizacion_ms } = req.body;

    if (!usuario_id || !tipo_interaccion) {
      return res.status(400).json({ error: 'usuario_id y tipo_interaccion son requeridos' });
    }

    // Upsert para no duplicar si por alguna razón hace swipe dos veces rápido
    const interaccion = await UsuarioInteraccion.findOneAndUpdate(
      { usuario_id, prenda_id },
      { 
        tipo_interaccion,
        tiempo_visualizacion_ms: tiempo_visualizacion_ms || 0,
        fecha_interaccion: Date.now()
      },
      { upsert: true, new: true }
    );

    res.status(201).json(interaccion);
  } catch (error) {
    console.error('❌ Error al registrar interacción:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar interacción.' });
  }
};

// Obtener las prendas con las que interactuó el usuario (solo las no ocultas)
exports.obtenerInteracciones = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    // Buscamos todas las interacciones y populamos prenda_id
    const interacciones = await UsuarioInteraccion.find({ 
      usuario_id
    }).populate('prenda_id');

    // Mapeamos para devolver un formato amigable para el Frontend
    const resultado = interacciones.map(int => {
      // Evitamos errores si la prenda fue eliminada de la base de datos
      if (!int.prenda_id) return null; 

      return {
        _id: int._id, // ID de la interacción
        tipo_interaccion: int.tipo_interaccion,
        fecha_interaccion: int.fecha_interaccion,
        prenda: {
          id: int.prenda_id._id,
          nombre: int.prenda_id.nombre,
          categoria: int.prenda_id.categoria,
          imagen: int.prenda_id.metadata?.url_imagen || '',
          detalles: {
            corte: int.prenda_id.atributos_diseno?.corte || 'N/A',
            cuello: int.prenda_id.atributos_diseno?.tipo_cuello || 'N/A',
            color: int.prenda_id.metadata?.color_dominante || 'N/A'
          }
        }
      };
    }).filter(item => item !== null);

    res.status(200).json(resultado);
  } catch (error) {
    console.error('❌ Error al obtener interacciones:', error);
    res.status(500).json({ error: 'Error interno del servidor al obtener interacciones.' });
  }
};

// Eliminar una interacción (remover del armario y permitir que vuelva al Feed)
exports.eliminarInteraccion = async (req, res) => {
  try {
    const { interaccion_id } = req.params;

    const interaccion = await UsuarioInteraccion.findByIdAndDelete(interaccion_id);

    if (!interaccion) {
      return res.status(404).json({ error: 'Interacción no encontrada' });
    }

    res.status(200).json({ message: 'Interacción eliminada correctamente', interaccion });
  } catch (error) {
    console.error('❌ Error al eliminar interacción:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar interacción.' });
  }
};
