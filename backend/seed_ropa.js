const mongoose = require('mongoose');
const Prenda = require('./src/models/Prenda');

// URI de conexión (usamos 127.0.0.1 para evitar problemas con localhost en IPv6)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/asesor_imagen_ia';

const prendasDePrueba = [
  {
    id_prenda: 'PRN-001',
    nombre: 'Chaqueta de Cuero Clásica',
    categoria: 'Superior',
    atributos_diseno: {
      corte: 'Ajustado',
      tipo_cuello: 'Solapa',
      volumen: 'Medio'
    },
    tags_compatibilidad: ['Triángulo Invertido', 'Rectángulo'],
    metadata: {
      color_dominante: 'Negro',
      url_imagen: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id_prenda: 'PRN-002',
    nombre: 'Camisa Blanca Slim Fit',
    categoria: 'Superior',
    atributos_diseno: {
      corte: 'Slim',
      tipo_cuello: 'Italiano',
      volumen: 'Bajo'
    },
    tags_compatibilidad: ['Reloj de Arena', 'Óvalo'],
    metadata: {
      color_dominante: 'Blanco',
      url_imagen: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id_prenda: 'PRN-003',
    nombre: 'Pantalón Chino Beige',
    categoria: 'Inferior',
    atributos_diseno: {
      corte: 'Recto',
      tiro: 'Medio'
    },
    tags_compatibilidad: ['Triángulo', 'Rectángulo'],
    metadata: {
      color_dominante: 'Beige',
      url_imagen: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  },
  {
    id_prenda: 'PRN-004',
    nombre: 'Zapatillas Urbanas Blancas',
    categoria: 'Calzado',
    atributos_diseno: {
      corte: 'Bajo',
      volumen: 'Bajo'
    },
    tags_compatibilidad: ['Universal'],
    metadata: {
      color_dominante: 'Blanco',
      url_imagen: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Conectado a MongoDB para inyección de datos (asesor_imagen_ia)');

    // Limpiar prendas existentes para evitar duplicados
    await Prenda.deleteMany({});
    console.log('🧹 Colección de Prendas limpiada');

    // Insertar prendas de prueba
    await Prenda.insertMany(prendasDePrueba);
    console.log('✅ Prendas inyectadas con éxito');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error inyectando datos:', error);
    process.exit(1);
  }
};

seedData();
