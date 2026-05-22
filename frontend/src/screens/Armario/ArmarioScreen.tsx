import React, { useState, useCallback, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal, SafeAreaView, Dimensions, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { NODE_API_URL } from '../../../config/config';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // padding horizontal 16*2 + gap 16 = 48

interface Prenda {
  id: string; // ID de la interacción
  prenda_id: string; // ID real de la prenda
  nombre: string;
  categoria: string;
  imagen: string;
  detalles: {
    corte: string;
    cuello: string;
    color: string;
  };
}

interface Outfit {
  _id: string;
  usuario_id: string;
  prenda_superior_id: any;
  prenda_inferior_id: any;
}

const FALLBACK_IMAGE = 'https://via.placeholder.com/300x400/333333/FFFFFF?text=Sin+Imagen';

export default function ArmarioScreen() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'favoritas' | 'descartadas' | 'looks'>('favoritas');
  const [favoritas, setFavoritas] = useState<Prenda[]>([]);
  const [descartadas, setDescartadas] = useState<Prenda[]>([]);
  const [looks, setLooks] = useState<Outfit[]>([]);
  const [selectedPrenda, setSelectedPrenda] = useState<Prenda | null>(null);
  const [loading, setLoading] = useState(true);
  
  const currentData = activeTab === 'favoritas' ? favoritas : activeTab === 'descartadas' ? descartadas : looks;

  useFocusEffect(
    useCallback(() => {
      if (user?._id) {
        fetchData();
      }
    }, [user])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener Interacciones
      const response = await fetch(`${NODE_API_URL}/api/interacciones/${user?._id}`);
      if (!response.ok) throw new Error('Error al obtener interacciones');
      const data = await response.json();
      
      const likes = data.filter((int: any) => int.tipo_interaccion === 'LIKE').map((int: any) => ({
        id: int._id,
        prenda_id: int.prenda.id,
        nombre: int.prenda.nombre,
        categoria: int.prenda.categoria,
        imagen: int.prenda.imagen,
        detalles: int.prenda.detalles
      }));
      
      const dislikes = data.filter((int: any) => int.tipo_interaccion === 'DISLIKE').map((int: any) => ({
        id: int._id,
        prenda_id: int.prenda.id,
        nombre: int.prenda.nombre,
        categoria: int.prenda.categoria,
        imagen: int.prenda.imagen,
        detalles: int.prenda.detalles
      }));

      setFavoritas(likes);
      setDescartadas(dislikes);

      // 2. Generar nuevos looks
      await fetch(`${NODE_API_URL}/api/combinations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: user?._id })
      });

      // 3. Obtener looks
      const looksRes = await fetch(`${NODE_API_URL}/api/combinations/${user?._id}`);
      if (looksRes.ok) {
        const looksData = await looksRes.json();
        setLooks(looksData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInteraction = async (id: string) => {
    try {
      await fetch(`${NODE_API_URL}/api/interacciones/${id}`, { method: 'DELETE' });
      if (activeTab === 'favoritas') {
        setFavoritas(prev => prev.filter(p => p.id !== id));
      } else {
        setDescartadas(prev => prev.filter(p => p.id !== id));
      }
      setSelectedPrenda(null);
    } catch (error) {
      console.error('Error al eliminar interacción:', error);
    }
  };

  const handleRemoveOutfit = async (id: string) => {
    try {
      await fetch(`${NODE_API_URL}/api/combinations/${id}`, { method: 'DELETE' });
      setLooks(prev => prev.filter(l => l._id !== id));
    } catch (error) {
      console.error('Error al eliminar outfit:', error);
    }
  };

  const renderItem = useCallback(({ item }: { item: any }) => {
    if (activeTab === 'looks') {
      return (
        <OutfitCard 
          item={item} 
          onRemove={() => handleRemoveOutfit(item._id)} 
        />
      );
    }
    return (
      <PrendaCard 
        item={item} 
        onPress={() => setSelectedPrenda(item)} 
        onRemove={() => handleRemoveInteraction(item.id)} 
      />
    );
  }, [activeTab, favoritas, descartadas, looks]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-900 pt-8">
      {/* Header Tabs */}
      <View className="flex-row justify-center mt-6 px-4 border-b border-neutral-800">
        <TouchableOpacity 
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'favoritas' ? 'border-indigo-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('favoritas')}
        >
          <Text className={`font-bold text-sm ${activeTab === 'favoritas' ? 'text-white' : 'text-neutral-500'}`}>
            Mis Favoritos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'looks' ? 'border-indigo-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('looks')}
        >
          <Text className={`font-bold text-sm ${activeTab === 'looks' ? 'text-white' : 'text-neutral-500'}`}>
            Mis Looks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-4 items-center border-b-2 ${activeTab === 'descartadas' ? 'border-indigo-500' : 'border-transparent'}`}
          onPress={() => setActiveTab('descartadas')}
        >
          <Text className={`font-bold text-sm ${activeTab === 'descartadas' ? 'text-white' : 'text-neutral-500'}`}>
            Descartados
          </Text>
        </TouchableOpacity>
      </View>

      {/* Grid */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          key={activeTab === 'looks' ? '1-col' : '2-col'}
          data={currentData}
          keyExtractor={(item) => activeTab === 'looks' ? item._id : item.id}
          numColumns={activeTab === 'looks' ? 1 : 2}
          contentContainerStyle={{ padding: 16 }}
          columnWrapperStyle={activeTab === 'looks' ? undefined : { justifyContent: 'space-between', marginBottom: 16 }}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-neutral-500 text-lg">No hay elementos en esta sección.</Text>
            </View>
          }
        />
      )}

      {/* Modal / Bottom View para Detalles de Prenda Individual */}
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
                        <Text className="text-neutral-300 font-medium">{selectedPrenda.detalles?.corte || 'N/A'}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-neutral-500 w-16">Cuello</Text>
                        <Text className="text-neutral-300 font-medium">{selectedPrenda.detalles?.cuello || 'N/A'}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-neutral-500 w-16">Color</Text>
                        <Text className="text-neutral-300 font-medium">{selectedPrenda.detalles?.color || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => handleRemoveInteraction(selectedPrenda.id)}
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

// Componente OutfitCard para la pestaña Mis Looks
const OutfitCard = ({ item, onRemove }: { item: Outfit, onRemove: () => void }) => {
  const superior = item.prenda_superior_id;
  const inferior = item.prenda_inferior_id;

  const [imgSup, setImgSup] = useState(superior?.metadata?.url_imagen || FALLBACK_IMAGE);
  const [imgInf, setImgInf] = useState(inferior?.metadata?.url_imagen || FALLBACK_IMAGE);

  return (
    <View className="mb-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm p-4">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center space-x-2">
          <Text className="text-white font-bold text-sm tracking-wider uppercase">
            ✨ Outfit Combinado por IA
          </Text>
        </View>
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={onRemove}
          className="w-8 h-8 bg-neutral-800 rounded-full items-center justify-center border border-white/10"
        >
          <Text className="text-red-400 text-xs font-bold">✕</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row space-x-3 h-[280px]">
        {/* Prenda Superior */}
        <View className="flex-1 bg-neutral-800 rounded-xl overflow-hidden relative border border-neutral-800/50">
           <Image 
             source={{ uri: imgSup }}
             onError={() => setImgSup(FALLBACK_IMAGE)}
             className="w-full h-full"
             resizeMode="cover"
           />
           <View className="absolute bottom-0 w-full p-3 bg-black/60">
             <Text numberOfLines={1} className="text-white text-xs font-bold mb-1">{superior?.nombre || 'Superior'}</Text>
             <Text className="text-neutral-400 text-[10px] uppercase tracking-widest">{superior?.categoria || 'CATEGORÍA'}</Text>
           </View>
        </View>

        {/* Prenda Inferior */}
        <View className="flex-1 bg-neutral-800 rounded-xl overflow-hidden relative border border-neutral-800/50">
           <Image 
             source={{ uri: imgInf }}
             onError={() => setImgInf(FALLBACK_IMAGE)}
             className="w-full h-full"
             resizeMode="cover"
           />
           <View className="absolute bottom-0 w-full p-3 bg-black/60">
             <Text numberOfLines={1} className="text-white text-xs font-bold mb-1">{inferior?.nombre || 'Inferior'}</Text>
             <Text className="text-neutral-400 text-[10px] uppercase tracking-widest">{inferior?.categoria || 'CATEGORÍA'}</Text>
           </View>
        </View>
      </View>
    </View>
  );
};

// Componente PrendaCard para Favoritas/Descartadas
const PrendaCard = ({ item, onPress, onRemove }: { item: Prenda, onPress: () => void, onRemove: () => void }) => {
  const [imgUri, setImgUri] = useState(item.imagen);

  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      style={{ width: cardWidth, marginBottom: 16 }}
      className="bg-neutral-800/80 border border-neutral-700/50 rounded-2xl overflow-hidden shadow-sm"
    >
      <View className="relative w-full aspect-[3/4] bg-neutral-800">
        <Image 
          source={{ uri: imgUri }}
          onError={() => setImgUri(FALLBACK_IMAGE)}
          className="w-full h-full"
          resizeMode="cover"
        />
        
        <View className="absolute bottom-0 w-full h-12 bg-black/40" />

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
