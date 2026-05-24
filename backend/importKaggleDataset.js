require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Prenda = require('./src/models/Prenda');

// Rutas a los datos
const STYLES_CSV_PATH = path.join(__dirname, 'src', 'data', 'styles.csv');
const IMAGES_DIR = path.join(__dirname, 'public', 'images', 'Prendas');

// Iniciar conexión y proceso
async function run() {
  await connectDB();
  console.log('⏳ Iniciando importación del dataset de Kaggle...');

  if (!fs.existsSync(STYLES_CSV_PATH)) {
    console.error(`❌ No se encontró el archivo styles.csv en ${STYLES_CSV_PATH}`);
    process.exit(1);
  }

  const batchSize = 500;
  let batch = [];
  let procesados = 0;
  let insertadosTotales = 0;
  let ignoradosTotales = 0;

  const readStream = fs.createReadStream(STYLES_CSV_PATH).pipe(csv());

  readStream.on('data', async (row) => {
    try {
      const { id, articleType, baseColour, usage, masterCategory, subCategory } = row;
      
      // Ignorar registros sin ID válido
      if (!id) return;

      // 1. Validar existencia de la imagen local
      const imgName = `${id}.jpg`;
      const imgPath = path.join(IMAGES_DIR, imgName);
      
      if (!fs.existsSync(imgPath)) {
        ignoradosTotales++;
        return; // Saltea este registro si no hay imagen
      }

      // 2. Diccionario de Mapeo
      const nombre = `${baseColour || ''} ${articleType || 'Prenda'}`.trim();
      
      let categoria = 'Accesorio';
      if (masterCategory === 'Apparel' || usage === 'Apparel' || usage === 'Casual') {
        if (subCategory === 'Topwear') categoria = 'Superior';
        else if (subCategory === 'Bottomwear') categoria = 'Inferior';
        else if (subCategory === 'Footwear') categoria = 'Calzado';
      } else if (masterCategory === 'Footwear') {
        categoria = 'Calzado';
      }

      // 3. Reglas de Estilo por Defecto (Atributos Diseño)
      let atributos_diseno = {
        corte: 'Regular',
        tipo_cuello: 'Desconocido',
        volumen: 'Normal'
      };

      const tipoLower = (articleType || '').toLowerCase();
      if (tipoLower.includes('tshirt') || tipoLower.includes('t-shirt') || tipoLower.includes('top')) {
        atributos_diseno = { corte: 'Regular', tipo_cuello: 'Redondo', volumen: 'Normal' };
      } else if (tipoLower.includes('shirt')) {
        atributos_diseno = { corte: 'Slim', tipo_cuello: 'Camisero', volumen: 'Normal' };
      } else if (tipoLower.includes('jeans') || tipoLower.includes('trouser')) {
        atributos_diseno = { corte: 'Straight', tiro: 'Medio', volumen: 'Normal' };
      } else if (tipoLower.includes('jacket') || tipoLower.includes('sweater')) {
        atributos_diseno = { corte: 'Regular', tipo_cuello: 'Alto', volumen: 'Oversize' };
      }

      // 4. Tags de Compatibilidad Lógicos
      let tags_compatibilidad = [];
      if (atributos_diseno.corte === 'Slim' || atributos_diseno.corte === 'Straight') {
        tags_compatibilidad.push('Universal', 'Rectángulo');
      }
      if (atributos_diseno.volumen === 'Oversize' || categoria === 'Superior' && atributos_diseno.tipo_cuello === 'Alto') {
        tags_compatibilidad.push('Triángulo Invertido');
      }
      // Asegurar que no quede vacío si no calzó en ninguna
      if (tags_compatibilidad.length === 0) tags_compatibilidad.push('Universal');

      const prenda = {
        id_prenda: id,
        nombre,
        categoria,
        atributos_diseno,
        tags_compatibilidad,
        siluetas_compatibles: tags_compatibilidad, // Mismo mapeo base
        metadata: {
          color_dominante: baseColour || 'Multicolor',
          url_imagen: `/images/Prendas/${id}.jpg`
        }
      };

      batch.push(prenda);

      // Si el lote llega al límite, pausamos y subimos a BD
      if (batch.length >= batchSize) {
        readStream.pause(); // Pausar lectura de stream
        procesados += batch.length;
        
        try {
          // ordered: false permite que si hay un error por duplicate_id, inserte el resto del batch igual
          await Prenda.insertMany(batch, { ordered: false });
          insertadosTotales += batch.length;
        } catch (error) {
          if (error.code === 11000) {
             // Ignoramos el error 11000 (duplicate key) y continuamos
             const repetidos = error.writeErrors ? error.writeErrors.length : 0;
             insertadosTotales += (batch.length - repetidos);
          } else {
             console.error('⚠️ Error insertando lote:', error);
          }
        }

        console.log(`✅ Procesados ${procesados} registros...`);
        batch = []; // Limpiar batch
        readStream.resume(); // Reanudar lectura
      }

    } catch (err) {
      console.error('Error procesando fila:', err);
    }
  });

  readStream.on('end', async () => {
    // Insertar lo que quede en el último lote
    if (batch.length > 0) {
      procesados += batch.length;
      try {
        await Prenda.insertMany(batch, { ordered: false });
        insertadosTotales += batch.length;
      } catch (error) {
        if (error.code === 11000) {
           const repetidos = error.writeErrors ? error.writeErrors.length : 0;
           insertadosTotales += (batch.length - repetidos);
        } else {
           console.error('⚠️ Error insertando lote final:', error);
        }
      }
      console.log(`✅ Procesados ${procesados} registros (Lote Final).`);
    }

    console.log(`\n🎉 ¡Importación finalizada!`);
    console.log(`📊 Total registros leídos del CSV que pasaron filtros: ${procesados}`);
    console.log(`🗑️  Total ignorados (sin imagen en public/images/Prendas): ${ignoradosTotales}`);
    console.log(`💾 Total nuevos insertados en MongoDB: ${insertadosTotales}`);
    process.exit(0);
  });

  readStream.on('error', (error) => {
    console.error('❌ Error leyendo el CSV:', error);
    process.exit(1);
  });
}

run();
