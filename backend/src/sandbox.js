const mongoose = require('mongoose');
const connectDB = require('./config/database');
const Usuario = require('./models/Usuario');
const Prenda = require('./models/Prenda');
const Combinacion = require('./models/Combinacion');
const EstiloConfig = require('./models/EstiloConfig');

const runSandbox = async () => {
  console.log('🧪 Iniciando Sandbox de Pruebas Completo...');
  
  await connectDB();
  
  try {
    console.log('\n🧹 [1/7] Limpiando pruebas anteriores...');
    await Promise.all([
      Usuario.deleteMany({ email: 'test_sandbox@ejemplo.com' }),
      Prenda.deleteMany({ id_prenda: { $in: ['P-001', 'P-002'] } }),
      Combinacion.deleteMany({ nombre: 'Outfit de Prueba' }),
      EstiloConfig.deleteMany({ nombre_estilo: 'Minimalista Sandbox' })
    ]);

    console.log('\n🎨 [2/7] Creando Estilo...');
    const estilo = await EstiloConfig.create({
      nombre_estilo: 'Minimalista Sandbox',
      descripcion: 'Estilo simple y elegante, ideal para pruebas.',
      reglas: { 
        colores_permitidos: ['Negro', 'Blanco', 'Gris'], 
        prendas_clave: ['Camiseta básica', 'Pantalón recto'] 
      }
    });
    console.log('✅ Estilo creado:', estilo.nombre_estilo);

    console.log('\n📝 [3/7] Creando Usuario...');
    const usuario = await Usuario.create({
      email: 'test_sandbox@ejemplo.com',
      password_hash: 'hash_super_secreto',
      nombre: 'Sujeto de Pruebas 01',
      medidas_morfometricas: { S: 42, W: 32, H: 40 },
      silueta_detectada: 'Triángulo Invertido'
    });
    console.log('✅ Usuario creado:', usuario.nombre);

    console.log('\n👕 [4/7] Creando Prendas...');
    const prenda1 = await Prenda.create({
      id_prenda: 'P-001',
      nombre: 'Camiseta Blanca Básica',
      categoria: 'Superior',
      atributos_diseno: { tipo_cuello: 'Redondo', corte: 'Regular' },
      metadata: { color_dominante: 'Blanco' }
    });
    
    const prenda2 = await Prenda.create({
      id_prenda: 'P-002',
      nombre: 'Pantalón Negro',
      categoria: 'Inferior',
      atributos_diseno: { corte: 'Slim', tiro: 'Medio' },
      metadata: { color_dominante: 'Negro' }
    });
    console.log('✅ Prendas creadas:', prenda1.nombre, 'y', prenda2.nombre);

    console.log('\n✨ [5/7] Creando Combinación (Outfit)...');
    const combinacion = await Combinacion.create({
      nombre: 'Outfit de Prueba',
      estilo_base: estilo.nombre_estilo,
      prendas: [prenda1._id, prenda2._id],
      generada_por_ia: true,
      usuario_creador: usuario._id
    });
    console.log('✅ Combinación creada con ID:', combinacion._id.toString());

    console.log('\n🔍 [6/7] Recuperando Combinación con Populate (Resolviendo Relaciones)...');
    const outfitRecuperado = await Combinacion.findById(combinacion._id)
      .populate('prendas')
      .populate('usuario_creador');

    if (outfitRecuperado) {
      console.log('✅ Outfit recuperado y relacionado exitosamente:');
      console.log(`   - Nombre del Outfit: ${outfitRecuperado.nombre}`);
      console.log(`   - Estilo Base: ${outfitRecuperado.estilo_base}`);
      console.log(`   - Creado para el Usuario: ${outfitRecuperado.usuario_creador.nombre} (${outfitRecuperado.usuario_creador.email})`);
      console.log(`   - Generado por IA: ${outfitRecuperado.generada_por_ia ? 'Sí' : 'No'}`);
      console.log(`   - Prendas incluidas (${outfitRecuperado.prendas.length}):`);
      outfitRecuperado.prendas.forEach(p => {
        console.log(`       * [${p.categoria}] ${p.nombre} (Color: ${p.metadata.color_dominante})`);
      });
    } else {
      console.log('❌ Error: No se pudo recuperar el outfit.');
    }

    console.log('\n🧹 [7/7] Limpiando la base de datos (eliminando datos de prueba)...');
    await Promise.all([
      Usuario.deleteOne({ _id: usuario._id }),
      Prenda.deleteMany({ _id: { $in: [prenda1._id, prenda2._id] } }),
      Combinacion.deleteOne({ _id: combinacion._id }),
      EstiloConfig.deleteOne({ _id: estilo._id })
    ]);
    console.log('✅ Limpieza completada.');

  } catch (error) {
    console.error('\n❌ Error durante la ejecución del sandbox:', error);
  } finally {
    console.log('\n🔌 Cerrando conexión a la BD...');
    await mongoose.connection.close();
    console.log('🏁 Sandbox finalizado exitosamente.');
  }
};

runSandbox();
