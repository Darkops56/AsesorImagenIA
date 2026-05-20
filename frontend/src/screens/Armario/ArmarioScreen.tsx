import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, SafeAreaView, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // padding horizontal 16*2 + gap 16 = 48

interface Prenda {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  detalles: {
    corte: string;
    cuello: string;
    color: string;
  };
}

// Datos provisionales
const mockFavoritas: Prenda[] = [
  { id: '1', nombre: 'Chaqueta de Cuero Vintage', categoria: 'Abrigos', imagen: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500', detalles: { corte: 'Slim Fit', cuello: 'Mao', color: 'Negro' } },
  { id: '2', nombre: 'Vestido de Seda Floral', categoria: 'Vestidos', imagen: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500', detalles: { corte: 'A-Line', cuello: 'V', color: 'Azul Marino' } },
  { id: '3', nombre: 'Abrigo de Lana Minimalista', categoria: 'Abrigos', imagen: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=500', detalles: { corte: 'Oversize', cuello: 'Solapa', color: 'Camel' } },
  { id: '4', nombre: 'Blusa Blanca Elegante', categoria: 'Camisas', imagen: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=500', detalles: { corte: 'Regular', cuello: 'Clásico', color: 'Blanco' } },
];

const mockDescartadas: Prenda[] = [
  { id: '5', nombre: 'Camiseta Gráfica Neón', categoria: 'Camisetas', imagen: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=500', detalles: { corte: 'Regular', cuello: 'Redondo', color: 'Amarillo' } },
  { id: '6', nombre: 'Pantalones Cargo Camuflaje', categoria: 'Pantalones', imagen: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=500', detalles: { corte: 'Relaxed', cuello: 'N/A', color: 'Verde' } },
];

const FALLBACK_IMAGE = 'https://via.placeholder.com/300x400/333333/FFFFFF?text=Sin+Imagen';

export default function ArmarioScreen() {
  const [activeTab, setActiveTab] = useState<'favoritas' | 'descartadas'>('favoritas');
  const [favoritas, setFavoritas] = useState<Prenda[]>(mockFavoritas);
  const [descartadas, setDescartadas] = useState<Prenda[]>(mockDescartadas);
  const [selectedPrenda, setSelectedPrenda] = useState<Prenda | null>(null);
  
  const currentData = activeTab === 'favoritas' ? favoritas : descartadas;

  const handleRemove = (id: string) => {
    if (activeTab === 'favoritas') {
      setFavoritas(prev => prev.filter(p => p.id !== id));
    } else {
      setDescartadas(prev => prev.filter(p => p.id !== id));
    }
    setSelectedPrenda(null);
  };

  const renderPrendaCard = useCallback(({ item }: { item: Prenda }) => {
    return (
      <PrendaCard 
        item={item} 
        onPress={() => setSelectedPrenda(item)} 
        onRemove={() => handleRemove(item.id)} 
      />
    );
  }, [activeTab, favoritas, descartadas]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      {/* Header Tabs */}
      <View className="flex-row justify-center mt-4 px-4 border-b border-neutral-800">
        <TouchableOpacity 
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'favoritas' ? 'border-indigo-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('favoritas')}
        >
          <Text className={`font-bold text-base ${activeTab === 'favoritas' ? 'text-white' : 'text-neutral-500'}`}>
            Mis Favoritos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'descartadas' ? 'border-indigo-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('descartadas')}
        >
          <Text className={`font-bold text-base ${activeTab === 'descartadas' ? 'text-white' : 'text-neutral-500'}`}>
            Descartados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 16 }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        renderItem={renderPrendaCard}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center mt-20">
            <Text className="text-neutral-500 text-lg">No hay prendas en esta sección.</Text>
          </View>
        }
      />

      {/* Modal / Bottom View para Detalles */}
      <Modal
        visible={!!selectedPrenda}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPrenda(null)}
      >
        <View className="flex-1 justify-end bg-black/80">
          <TouchableOpacity 
            className="flex-1" 
            activeOpacity={1} 
            onPress={() => setSelectedPrenda(null)} 
          />
          <View className="bg-neutral-900 rounded-t-3xl border-t border-neutral-800 p-6 min-h-[60%]">
            {selectedPrenda && (
              <>
                <View className="items-center mb-6">
                  <View className="w-12 h-1 bg-neutral-700 rounded-full" />
                </View>
                
                <View className="flex-row items-start space-x-4">
                  <Image 
                    source={{ uri: selectedPrenda.imagen }} 
                    defaultSource={{ uri: FALLBACK_IMAGE }}
                    className="w-32 h-48 rounded-xl bg-neutral-800"
                    resizeMode="cover"
                  />
                  
                  <View className="flex-1 justify-center py-2">
                    <Text className="text-white text-2xl font-bold mb-1 leading-tight">
                      {selectedPrenda.nombre}
                    </Text>
                    <Text className="text-neutral-400 text-sm mb-4 uppercase tracking-wider font-semibold">
                      {selectedPrenda.categoria}
                    </Text>
                    
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <Text className="text-neutral-500 w-16">Corte</Text>
                        <Text className="text-neutral-300 font-medium">{selectedPrenda.detalles.corte}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-neutral-500 w-16">Cuello</Text>
                        <Text className="text-neutral-300 font-medium">{selectedPrenda.detalles.cuello}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-neutral-500 w-16">Color</Text>
                        <Text className="text-neutral-300 font-medium">{selectedPrenda.detalles.color}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => handleRemove(selectedPrenda.id)}
                  className="mt-8 py-4 rounded-xl bg-red-500/10 border border-red-500/30 items-center"
                >
                  <Text className="text-red-400 font-bold text-base">Eliminar de la colección</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setSelectedPrenda(null)}
                  className="mt-4 py-4 items-center"
                >
                  <Text className="text-neutral-400 font-semibold">Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Componente PrendaCard
const PrendaCard = ({ item, onPress, onRemove }: { item: Prenda, onPress: () => void, onRemove: () => void }) => {
  const [imgUri, setImgUri] = useState(item.imagen);

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      style={{ width: cardWidth }}
      className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl overflow-hidden shadow-sm"
    >
      <View className="relative w-full aspect-[3/4] bg-neutral-800">
        <Image 
          source={{ uri: imgUri }}
          onError={() => setImgUri(FALLBACK_IMAGE)}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        {/* Gradiente sutil en la parte inferior de la imagen (requiere nativewind) */}
        <View className="absolute bottom-0 w-full h-12 bg-black/40" />

        {/* Botón Flotante Eliminar */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={onRemove}
          className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full items-center justify-center border border-white/10"
        >
          <Text className="text-red-400 text-xs font-bold">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="p-3 bg-neutral-800/90">
        <Text 
          numberOfLines={1} 
          className="text-white font-bold text-sm mb-1"
        >
          {item.nombre}
        </Text>
        <Text className="text-neutral-400 text-xs uppercase tracking-widest">
          {item.categoria}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
