const Usuario = require('../models/Usuario');

/**
 * Función auxiliar para evaluar la tolerancia entre Hombros (S) y Cadera (H)
 * S ≈ H significa que la diferencia es menor o igual al 5%
 */
const sonAproximadamenteIguales = (val1, val2, tolerancia = 0.05) => {
  const diff = Math.abs(val1 - val2);
  const maxVal = Math.max(val1, val2);
  return (diff / maxVal) <= tolerancia;
};

/**
 * Calcula la silueta basada en medidas morfométricas
 * S (Shoulders), W (Waist), H (Hips)
 */
const calcularSilueta = (S, W, H) => {
  if (!S || !W || !H) return null;

  // Óvalo (Manzana): W > S y W > H
  if (W > S && W > H) {
    return 'Óvalo';
  }

  // Triángulo (Pera): H > S * 1.05
  if (H > S * 1.05) {
    return 'Triángulo';
  }

  // Triángulo Invertido: S > H * 1.05
  if (S > H * 1.05) {
    return 'Triángulo Invertido';
  }

  // S ≈ H (Son similares, caen en Reloj de Arena o Rectángulo)
  if (sonAproximadamenteIguales(S, H)) {
    if (W <= S * 0.75) {
      return 'Reloj de Arena';
    } else {
      return 'Rectángulo';
    }
  }

  // Fallback si los márgenes quedan en zonas grises extrañas
  return 'Rectángulo'; 
};

exports.evaluarMorfologia = async (req, res) => {
  try {
    const { usuarioId, S, W, H } = req.body;

    if (!S || !W || !H) {
      return res.status(400).json({ error: 'Se requieren las medidas S, W y H' });
    }

    const silueta = calcularSilueta(S, W, H);

    // Si hay un usuario en la DB, actualizamos sus medidas
    if (usuarioId) {
      const usuario = await Usuario.findByIdAndUpdate(
        usuarioId, 
        { 
          medidas_morfometricas: { S, W, H },
          silueta_detectada: silueta
        },
        { new: true }
      );
      
      if (!usuario) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      
      return res.status(200).json({ 
        message: 'Silueta calculada y usuario actualizado',
        silueta,
        usuario 
      });
    }

    // Si no hay usuarioId (modo invitado/evaluación rápida)
    return res.status(200).json({
      message: 'Cálculo exitoso',
      S, W, H,
      silueta
    });

  } catch (error) {
    console.error('Error al evaluar morfología:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
