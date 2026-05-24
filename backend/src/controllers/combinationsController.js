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

    // Clasificación semántica
    const bases = [];
    const outers = [];
    const inferiores = [];
    const calzados = [];
    const accesoriosBelt = [];
    const accesoriosWatch = [];
    const accesoriosEarrings = [];
    const accesoriosOthers = [];

    interacciones.forEach(int => {
      const prenda = int.prenda_id;
      if (!prenda) return;
      const cat = prenda.categoria.toLowerCase();
      const nom = prenda.nombre.toLowerCase();

      if (cat === 'superior') {
        if (nom.includes('jacket') || nom.includes('coat') || nom.includes('sweater') || nom.includes('hoodie') || nom.includes('blazer') || nom.includes('cardigan')) {
          outers.push(prenda);
        } else {
          bases.push(prenda);
        }
      } else if (cat === 'inferior') {
        inferiores.push(prenda);
      } else if (cat === 'calzado') {
        calzados.push(prenda);
      } else if (cat === 'accesorio') {
        if (nom.includes('belt')) accesoriosBelt.push(prenda);
        else if (nom.includes('watch')) accesoriosWatch.push(prenda);
        else if (nom.includes('earring') || nom.includes('zarcillo')) accesoriosEarrings.push(prenda);
        else accesoriosOthers.push(prenda);
      }
    });

    if (bases.length === 0 || inferiores.length === 0) {
      return res.status(200).json({ message: 'Se requiere al menos una prenda superior base y una prenda inferior para armar looks.', combinacionesGeneradas: 0 });
    }

    let combinacionesGeneradas = 0;
    const MAX_OUTFITS = 10;

    const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
    const chance = (prob) => Math.random() < prob;

    for (let i = 0; i < MAX_OUTFITS; i++) {
      const selectedBase = pickRandom(bases);
      const selectedInferior = pickRandom(inferiores);
      
      const selectedOuter = chance(0.6) ? pickRandom(outers) : null;
      const selectedShoe = chance(0.8) ? pickRandom(calzados) : null;

      const accs = [];
      if (chance(0.4)) { const b = pickRandom(accesoriosBelt); if (b) accs.push(b._id); }
      if (chance(0.5)) { const w = pickRandom(accesoriosWatch); if (w) accs.push(w._id); }
      if (chance(0.5)) { const e = pickRandom(accesoriosEarrings); if (e) accs.push(e._id); }
      if (chance(0.3)) { const o = pickRandom(accesoriosOthers); if (o) accs.push(o._id); }

      const outfitData = {
        usuario_id,
        prendas_base: [selectedBase._id],
        prendas_outer: selectedOuter ? [selectedOuter._id] : [],
        prenda_inferior: selectedInferior._id,
        calzado: selectedShoe ? selectedShoe._id : null,
        accesorios: accs
      };

      if (!outfitData.calzado) delete outfitData.calzado;

      // Verificar duplicados básicos
      const outerCondition = selectedOuter ? selectedOuter._id : { $exists: true, $size: 0 };
      
      const existe = await Combinacion.findOne({
        usuario_id,
        prendas_base: selectedBase._id,
        prenda_inferior: selectedInferior._id,
        prendas_outer: outerCondition
      });

      if (!existe) {
        await Combinacion.create({
          ...outfitData,
          nombre: `Look multicapa con ${selectedBase.nombre}`,
          generada_por_ia: true
        });
        combinacionesGeneradas++;
      }
    }

    res.status(201).json({ 
      message: 'Lote de combinaciones multicapa generado', 
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
      .populate('prendas_base')
      .populate('prendas_outer')
      .populate('prenda_inferior')
      .populate('calzado')
      .populate('accesorios')
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
