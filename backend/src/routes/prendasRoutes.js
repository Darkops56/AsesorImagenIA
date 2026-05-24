const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Prenda = require('../models/Prenda');
const UsuarioInteraccion = require('../models/UsuarioInteraccion');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/prendas/user-owned - Carga prenda propia de usuario
router.post('/user-owned', authMiddleware, async (req, res) => {
  try {
    const { nombre, categoria, atributos_diseno, metadata, image_base64 } = req.body;
    const usuario_id = req.user._id;

    if (!image_base64) {
      return res.status(400).json({ error: 'Falta la imagen en Base64' });
    }

    const uploadsDir = path.join(__dirname, '../../public/uploads/usuario_ropa');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
    const filename = `${usuario_id}_${Date.now()}.jpg`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, base64Data, 'base64');
    const url_imagen = `/uploads/usuario_ropa/${filename}`;

    const nuevaPrenda = new Prenda({
      id_prenda: `USR-${Date.now()}`,
      nombre: nombre || 'Mi Prenda',
      categoria: categoria || 'Superior',
      is_user_owned: true,
      usuario_id,
      atributos_diseno: atributos_diseno || { corte: 'Regular', tipo_cuello: 'Desconocido', volumen: 'Normal' },
      tags_compatibilidad: ['Universal'],
      siluetas_compatibles: ['Universal'],
      metadata: {
        color_dominante: metadata?.color_dominante || 'Neutro',
        url_imagen
      }
    });

    const prendaGuardada = await nuevaPrenda.save();

    const nuevaInteraccion = new UsuarioInteraccion({
      usuario_id,
      prenda_id: prendaGuardada._id,
      tipo_interaccion: 'LIKE'
    });
    await nuevaInteraccion.save();

    res.status(201).json({ message: 'Prenda guardada exitosamente', prenda: prendaGuardada });
  } catch (error) {
    console.error('❌ Error guardando prenda propia:', error);
    res.status(500).json({ error: 'Error interno guardando prenda' });
  }
});

// POST /api/prendas/maintenance/fix-calzado - Mantenimiento: Corregir categoría calzado
router.post('/maintenance/fix-calzado', async (req, res) => {
  try {
    const regex = /shoes|sneakers|footwear|flip flops/i;
    const resultado = await Prenda.updateMany(
      { nombre: { $regex: regex }, categoria: { $ne: 'Calzado' } },
      { $set: { categoria: 'Calzado' } }
    );
    res.status(200).json({ message: 'Prendas actualizadas a categoría Calzado', resultado });
  } catch (error) {
    console.error('❌ Error en fix-calzado:', error);
    res.status(500).json({ error: 'Error interno en mantenimiento de calzado' });
  }
});
// GET /api/prendas/search - Búsqueda flexible
router.get('/search', async (req, res) => {
  try {
    const { q, categoria, color, silueta, page = 1 } = req.query;
    const limit = 50;
    const skip = (parseInt(page) - 1) * limit;
    
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

    let prendas = await Prenda.find(query).skip(skip).limit(limit);

    if (silueta) {
      const siluetaRegex = new RegExp(`^${silueta}$`, 'i');
      prendas.sort((a, b) => {
        const aCompat = a.siluetas_compatibles?.some(s => siluetaRegex.test(s)) ? 1 : 0;
        const bCompat = b.siluetas_compatibles?.some(s => siluetaRegex.test(s)) ? 1 : 0;
        return bCompat - aCompat;
      });
    }

    res.status(200).json(prendas);
  } catch (error) {
    console.error('❌ Error en búsqueda de prendas:', error);
    res.status(500).json({ error: 'Error interno del servidor en la búsqueda.' });
  }
});

// GET /api/prendas/:id - Recuperar una prenda específica por su ID
router.get('/:id', async (req, res) => {
  try {
    const prenda = await Prenda.findById(req.params.id);
    if (!prenda) {
      return res.status(404).json({ error: 'Prenda no encontrada' });
    }
    res.status(200).json(prenda);
  } catch (error) {
    console.error('❌ Error al obtener la prenda por ID:', error);
    res.status(500).json({ error: 'Error interno del servidor al recuperar la prenda.' });
  }
});

// GET /api/prendas - Recuperar todas las prendas
router.get('/', async (req, res) => {
  try {
    const { silueta, usuario_id, seed_id } = req.query;
    let query = {};

    if (silueta) {
      // Case-insensitive match for the specific silueta and 'Universal' items
      const siluetaRegex = new RegExp(`^${silueta}$`, 'i');
      const universalRegex = new RegExp('^universal$', 'i');
      query = { tags_compatibilidad: { $in: [siluetaRegex, universalRegex] } };
    }

    let prendasInteractuadas = [];
    if (usuario_id) {
      // Find all interacted items for the user
      const interacciones = await UsuarioInteraccion.find({ usuario_id }).select('prenda_id');
      prendasInteractuadas = interacciones.map(int => int.prenda_id);
    }

    // El frontend coloca la prenda semilla en el índice 0, por lo que la excluimos para no duplicarla
    if (seed_id) {
      prendasInteractuadas.push(seed_id);
    }

    if (prendasInteractuadas.length > 0) {
      query._id = { $nin: prendasInteractuadas };
    }

    let prendas = await Prenda.find(query);

    // Algoritmo de Similitud (Content-Based)
    if (seed_id) {
      try {
        const prendaSemilla = await Prenda.findById(seed_id);
        if (prendaSemilla) {
          // Puntuar prendas restantes en base a la semilla
          const prendasPuntuadas = prendas.map(p => {
            let score = 0;
            
            // 1. Misma categoría (+10 puntos)
            if (p.categoria === prendaSemilla.categoria) score += 10;

            // 2. Atributos de diseño (+5 puntos por coincidencia)
            if (p.atributos_diseno && prendaSemilla.atributos_diseno) {
              if (p.atributos_diseno.corte && p.atributos_diseno.corte === prendaSemilla.atributos_diseno.corte) score += 5;
              if (p.atributos_diseno.tipo_cuello && p.atributos_diseno.tipo_cuello === prendaSemilla.atributos_diseno.tipo_cuello) score += 5;
              if (p.atributos_diseno.volumen && p.atributos_diseno.volumen === prendaSemilla.atributos_diseno.volumen) score += 5;
              if (p.atributos_diseno.tiro && p.atributos_diseno.tiro === prendaSemilla.atributos_diseno.tiro) score += 5;
            }

            // 3. Color dominante (+2 puntos)
            if (p.metadata?.color_dominante && prendaSemilla.metadata?.color_dominante && 
                p.metadata.color_dominante === prendaSemilla.metadata.color_dominante) {
              score += 2;
            }

            // 4. Tags de compatibilidad (+1.5 puntos por tag común)
            if (p.tags_compatibilidad && prendaSemilla.tags_compatibilidad) {
              const tagsComunes = p.tags_compatibilidad.filter(tag => prendaSemilla.tags_compatibilidad.includes(tag));
              score += tagsComunes.length * 1.5;
            }

            // 5. Prioridad Absoluta a Ropa Física (+50 puntos)
            if (p.is_user_owned === true) {
              score += 50;
            }

            return { prenda: p, score };
          });

          // Ordenar por puntuación descendente
          prendasPuntuadas.sort((a, b) => b.score - a.score);
          prendas = prendasPuntuadas.map(item => item.prenda);
        } else {
          // Si no se encuentra la semilla por algún motivo, mezclar aleatoriamente
          prendas.sort(() => Math.random() - 0.5);
        }
      } catch (err) {
        console.error('❌ Error aplicando algoritmo de similitud:', err);
        prendas.sort(() => Math.random() - 0.5);
      }
    } else {
      // Mezcla aleatoria por defecto
      prendas.sort(() => Math.random() - 0.5);
    }

    res.status(200).json(prendas);
  } catch (error) {
    console.error('❌ Error al obtener las prendas:', error);
    res.status(500).json({ error: 'Error interno del servidor al recuperar prendas.' });
  }
});

module.exports = router;
