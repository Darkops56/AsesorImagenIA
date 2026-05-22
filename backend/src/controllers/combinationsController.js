const Combinacion = require('../models/Combinacion');
const UsuarioInteraccion = require('../models/UsuarioInteraccion');

// Generar combinaciones a partir de prendas "LIKED"
exports.generateCombinations = async (req, res) => {
  try {
    const { usuario_id } = req.body;
    if (!usuario_id) {
      return res.status(400).json({ message: 'usuario_id es requerido' });
    }

    // Buscar prendas con LIKE del usuario
    const interacciones = await UsuarioInteraccion.find({ 
      usuario_id, 
      tipo_interaccion: 'LIKE' 
    }).populate('prenda_id');

    // Filtrar prendas válidas y separarlas por categoría
    const prendasSuperiores = [];
    const prendasInferiores = [];

    interacciones.forEach(int => {
      if (int.prenda_id) {
        if (int.prenda_id.categoria.toLowerCase() === 'superior') {
          prendasSuperiores.push(int.prenda_id);
        } else if (int.prenda_id.categoria.toLowerCase() === 'inferior') {
          prendasInferiores.push(int.prenda_id);
        }
      }
    });

    if (prendasSuperiores.length === 0 || prendasInferiores.length === 0) {
      return res.status(200).json({ message: 'No hay suficientes prendas para generar combinaciones', combinacionesGeneradas: 0 });
    }

    let combinacionesGeneradas = 0;

    // Generar todas las combinaciones posibles
    for (const superior of prendasSuperiores) {
      for (const inferior of prendasInferiores) {
        // Verificar si la combinación ya existe
        const existe = await Combinacion.findOne({
          usuario_id,
          prenda_superior_id: superior._id,
          prenda_inferior_id: inferior._id
        });

        if (!existe) {
          await Combinacion.create({
            usuario_id,
            prenda_superior_id: superior._id,
            prenda_inferior_id: inferior._id,
            nombre: `Outfit con ${superior.nombre} y ${inferior.nombre}`,
            generada_por_ia: true
          });
          combinacionesGeneradas++;
        }
      }
    }

    res.status(201).json({ 
      message: 'Combinaciones generadas exitosamente', 
      combinacionesGeneradas 
    });

  } catch (error) {
    console.error('Error al generar combinaciones:', error);
    res.status(500).json({ message: 'Error del servidor al generar combinaciones' });
  }
};

// Obtener combinaciones de un usuario
exports.getCombinations = async (req, res) => {
  try {
    const { usuario_id } = req.params;

    const combinaciones = await Combinacion.find({ usuario_id })
      .populate('prenda_superior_id')
      .populate('prenda_inferior_id')
      .sort({ fecha_creacion: -1 });

    res.status(200).json(combinaciones);
  } catch (error) {
    console.error('Error al obtener combinaciones:', error);
    res.status(500).json({ message: 'Error del servidor al obtener combinaciones' });
  }
};

// Eliminar una combinación
exports.deleteCombination = async (req, res) => {
  try {
    const { id } = req.params;

    const combinacionEliminada = await Combinacion.findByIdAndDelete(id);

    if (!combinacionEliminada) {
      return res.status(404).json({ message: 'Combinación no encontrada' });
    }

    res.status(200).json({ message: 'Combinación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar combinación:', error);
    res.status(500).json({ message: 'Error del servidor al eliminar combinación' });
  }
};
