const express = require('express');
const router = express.Router();
const Prenda = require('../models/Prenda');
const UsuarioInteraccion = require('../models/UsuarioInteraccion');

// GET /api/prendas/search - Búsqueda flexible
router.get('/search', async (req, res) => {
  try {
    const { q, categoria, color } = req.query;
    let query = {};

    if (q) {
      query.nombre = { $regex: q, $options: 'i' };
    }

    if (categoria && categoria !== 'Todo') {
      query.categoria = categoria;
    }

    if (color) {
      query['metadata.color_dominante'] = { $regex: color, $options: 'i' };
    }

    const prendas = await Prenda.find(query).limit(50);
    res.status(200).json(prendas);
  } catch (error) {
    console.error('❌ Error en búsqueda de prendas:', error);
    res.status(500).json({ error: 'Error interno del servidor en la búsqueda.' });
  }
});

// GET /api/prendas - Recuperar todas las prendas
router.get('/', async (req, res) => {
  try {
    const { silueta, usuario_id } = req.query;
    let query = {};

    if (silueta) {
      // Case-insensitive match for the specific silueta and 'Universal' items
      const siluetaRegex = new RegExp(`^${silueta}$`, 'i');
      const universalRegex = new RegExp('^universal$', 'i');
      query = { tags_compatibilidad: { $in: [siluetaRegex, universalRegex] } };
    }

    if (usuario_id) {
      // Find all interacted items for the user
      const interacciones = await UsuarioInteraccion.find({ usuario_id }).select('prenda_id');
      const prendasInteractuadas = interacciones.map(int => int.prenda_id);

      if (prendasInteractuadas.length > 0) {
        query._id = { $nin: prendasInteractuadas };
      }
    }

    const prendas = await Prenda.find(query);
    res.status(200).json(prendas);
  } catch (error) {
    console.error('❌ Error al obtener las prendas:', error);
    res.status(500).json({ error: 'Error interno del servidor al recuperar prendas.' });
  }
});

module.exports = router;
