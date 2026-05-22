import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { NODE_API_URL } from '../../../config/config';

interface Prenda {
  _id: string;
  id_prenda: string;
  nombre: string;
  categoria: string;
  siluetas_compatibles?: string[];
  atributos_diseno?: {
    corte?: string;
    tipo_cuello?: string;
    volumen?: string;
    tiro?: string;
  };
  metadata?: {
    color_dominante?: string;
    url_imagen?: string;
  };
}

const CATEGORIAS = ['Todo', 'Superior', 'Inferior', 'Calzado', 'Accesorio'];

export default function ExplorarScreen({ navigation }: any) {
  const { user } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para controlar prendas ya interactuadas
  const [interacciones, setInteracciones] = useState<any[]>([]);
  const [selectedPrenda, setSelectedPrenda] = useState<Prenda | null>(null);
  const [selectedInteraccion, setSelectedInteraccion] = useState<any | null>(null);
  const [updatingInteraccion, setUpdatingInteraccion] = useState(false);

  // Cargar interacciones cada vez que la pantalla tome foco
  const fetchInteracciones = async () => {
    if (!user?._id) return;
    try {
      const response = await fetch(`${NODE_API_URL}/api/interacciones/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setInteracciones(data);
      }
    } catch (error) {
      console.error('Error fetching interacciones in ExplorarScreen:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInteracciones();
    }, [user])
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchResultados();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory]);

  const fetchResultados = async () => {
    setLoading(true);
    try {
      let url = `${NODE_API_URL}/api/prendas/search?categoria=${activeCategory}`;
      if (searchQuery.trim() !== '') {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setPrendas(data);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  // Alternar el tipo de interacción (LIKE <-> DISLIKE)
  const handleToggleInteraccion = async () => {
    if (!user?._id || !selectedPrenda || !selectedInteraccion) return;
    setUpdatingInteraccion(true);
    try {
      const nuevoTipo = selectedInteraccion.tipo_interaccion === 'LIKE' ? 'DISLIKE' : 'LIKE';
      const response = await fetch(`${NODE_API_URL}/api/interacciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: user._id,
          prenda_id: selectedPrenda._id,
          tipo_interaccion: nuevoTipo,
        }),
      });

      if (response.ok) {
        await fetchInteracciones();
        // Actualizar el estado local para reflejar el cambio en el modal de forma instantánea
        setSelectedInteraccion((prev: any) => ({
          ...prev,
          tipo_interaccion: nuevoTipo,
        }));
      }
    } catch (error) {
      console.error('Error toggling interaccion:', error);
    } finally {
      setUpdatingInteraccion(false);
    }
  };

  // Eliminar la interacción de la colección
  const handleRemoveInteraccion = async () => {
    if (!selectedInteraccion?._id) return;
    setUpdatingInteraccion(true);
    try {
      const response = await fetch(`${NODE_API_URL}/api/interacciones/${selectedInteraccion._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchInteracciones();
        setSelectedPrenda(null);
        setSelectedInteraccion(null);
      }
    } catch (error) {
      console.error('Error removing interaccion:', error);
    } finally {
      setUpdatingInteraccion(false);
    }
  };

  const renderItem = ({ item }: { item: Prenda }) => {
    const isMatch = user?.silueta_detectada && item.siluetas_compatibles?.includes(user.silueta_detectada);
    const interaccionPrenda = interacciones.find(int => int.prenda?.id === item._id);

    return (
      <TouchableOpacity 
        className="flex-1 m-2 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700"
        onPress={() => {
          if (interaccionPrenda) {
            setSelectedPrenda(item);
            setSelectedInteraccion(interaccionPrenda);
          } else {
            navigation.navigate('Feed', { seedPrendaId: item._id, seedCategoria: item.categoria });
          }
        }}
      >
        <Image 
          source={{ uri: item.metadata?.url_imagen || 'https://via.placeholder.com/200x300' }} 
          className="w-full h-48"
          resizeMode="cover"
        />
        
        {isMatch && (
          <View className="absolute top-2 left-2 px-2 py-1 bg-indigo-500/90 rounded-full flex-row items-center border border-indigo-300">
            <Text className="text-white text-xs font-bold mr-1">Match IA</Text>
            <Ionicons name="sparkles" size={12} color="#fcd34d" />
          </View>
        )}

        {/* Indicador visual de si ya está guardada o descartada */}
        {interaccionPrenda && (
          <View className={`absolute top-2 right-2 p-1.5 rounded-full flex-row items-center bg-black/70 border ${
            interaccionPrenda.tipo_interaccion === 'LIKE' ? 'border-emerald-500/50' : 'border-rose-500/50'
          }`}>
            <Ionicons 
              name={interaccionPrenda.tipo_interaccion === 'LIKE' ? 'heart' : 'close-circle'} 
              size={12} 
              color={interaccionPrenda.tipo_interaccion === 'LIKE' ? '#10b981' : '#f43f5e'} 
            />
          </View>
        )}

        <View className="p-3">
          <Text className="text-white font-bold text-sm" numberOfLines={1}>{item.nombre}</Text>
          <Text className="text-slate-400 text-xs mt-1">{item.categoria}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-900 pt-12 px-4">
      {/* Search Bar */}
      <View className="flex-row items-center bg-slate-800 rounded-full px-4 py-3 mb-4 border border-slate-700">
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput 
          className="flex-1 ml-2 text-white text-base"
          placeholder="Busca chaquetas, vestidos..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Chips */}
      <View className="h-12 mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {CATEGORIAS.map((cat) => (
            <TouchableOpacity 
              key={cat}
              onPress={() => setActiveCategory(cat)}
              className={`px-5 py-2 mr-3 rounded-full border ${activeCategory === cat ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-600'}`}
            >
              <Text className={`font-semibold ${activeCategory === cat ? 'text-white' : 'text-slate-300'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results Grid */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#818cf8" />
        </View>
      ) : (
        <FlatList 
          data={prendas}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Ionicons name="shirt-outline" size={60} color="#475569" />
              <Text className="text-slate-400 text-lg mt-4 font-medium">No se encontraron prendas</Text>
            </View>
          }
        />
      )}

      {/* Modal de Detalle para Prenda ya Interactuada (Estilo Armario Premium) */}
      <Modal
        visible={!!selectedPrenda && !!selectedInteraccion}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setSelectedPrenda(null);
          setSelectedInteraccion(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/80">
          <TouchableOpacity 
            className="flex-1" 
            activeOpacity={1} 
            onPress={() => {
              setSelectedPrenda(null);
              setSelectedInteraccion(null);
            }} 
          />
          <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 p-6 min-h-[55%]">
            {selectedPrenda && selectedInteraccion && (
              <>
                <View className="items-center mb-6">
                  <View className="w-12 h-1 bg-slate-700 rounded-full" />
                </View>
                
                {/* Contenido Principal: Imagen e Info */}
                <View className="flex-row items-start space-x-4">
                  <Image 
                    source={{ uri: selectedPrenda.metadata?.url_imagen || 'https://via.placeholder.com/200x300' }} 
                    className="w-32 h-48 rounded-xl bg-slate-800"
                    resizeMode="cover"
                  />
                  
                  <View className="flex-1 justify-center py-1">
                    <Text className="text-white text-2xl font-bold mb-1 leading-tight" numberOfLines={2}>
                      {selectedPrenda.nombre}
                    </Text>
                    <Text className="text-indigo-400 text-sm mb-3 uppercase tracking-wider font-semibold">
                      {selectedPrenda.categoria}
                    </Text>

                    {/* Indicador de Estado en Armario */}
                    <View className="flex-row items-center mb-4">
                      <View className={`px-3 py-1 rounded-full flex-row items-center border ${
                        selectedInteraccion.tipo_interaccion === 'LIKE' 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-rose-500/10 border-rose-500/30'
                      }`}>
                        <Ionicons 
                          name={selectedInteraccion.tipo_interaccion === 'LIKE' ? 'heart' : 'close-circle'} 
                          size={14} 
                          color={selectedInteraccion.tipo_interaccion === 'LIKE' ? '#10b981' : '#f43f5e'} 
                        />
                        <Text className={`text-xs font-bold ml-1.5 ${
                          selectedInteraccion.tipo_interaccion === 'LIKE' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {selectedInteraccion.tipo_interaccion === 'LIKE' ? 'Guardado en Favoritos' : 'Guardado en Descartados'}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Detalles */}
                    <View className="space-y-2">
                      <View className="flex-row items-center">
                        <Text className="text-slate-500 text-xs w-16">Corte</Text>
                        <Text className="text-slate-300 text-xs font-medium">
                          {selectedPrenda.atributos_diseno?.corte || 'Estándar'}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-slate-500 text-xs w-16">Cuello</Text>
                        <Text className="text-slate-300 text-xs font-medium">
                          {selectedPrenda.atributos_diseno?.tipo_cuello || 'Estándar'}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="text-slate-500 text-xs w-16">Color</Text>
                        <Text className="text-slate-300 text-xs font-medium">
                          {selectedPrenda.metadata?.color_dominante || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Acciones */}
                <View className="mt-8 space-y-3">
                  {/* Botón dinámico para cambiar de estado */}
                  <TouchableOpacity 
                    disabled={updatingInteraccion}
                    onPress={handleToggleInteraccion}
                    className={`py-4 rounded-xl items-center border flex-row justify-center active:opacity-90 ${
                      selectedInteraccion.tipo_interaccion === 'LIKE' 
                        ? 'bg-slate-800 border-slate-700' 
                        : 'bg-indigo-600 border-indigo-500'
                    }`}
                  >
                    {updatingInteraccion ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons 
                          name={selectedInteraccion.tipo_interaccion === 'LIKE' ? 'close-circle-outline' : 'heart-outline'} 
                          size={18} 
                          color="#ffffff" 
                        />
                        <Text className="text-white font-bold text-base ml-2">
                          {selectedInteraccion.tipo_interaccion === 'LIKE' ? 'Mover a Descartados' : 'Mover a Favoritos'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Botón para navegar al Armario */}
                  <TouchableOpacity 
                    onPress={() => {
                      setSelectedPrenda(null);
                      setSelectedInteraccion(null);
                      navigation.navigate('Armario');
                    }}
                    className="py-4 rounded-xl bg-slate-800 border border-slate-700 items-center flex-row justify-center active:bg-slate-700"
                  >
                    <Ionicons name="shirt-outline" size={18} color="#818cf8" />
                    <Text className="text-indigo-300 font-bold text-base ml-2">Ver en mi Armario</Text>
                  </TouchableOpacity>

                  {/* Botón para eliminar interacción de la colección */}
                  <TouchableOpacity 
                    disabled={updatingInteraccion}
                    onPress={handleRemoveInteraccion}
                    className="py-4 rounded-xl bg-red-500/10 border border-red-500/30 items-center flex-row justify-center active:bg-red-500/20"
                  >
                    {updatingInteraccion ? (
                      <ActivityIndicator size="small" color="#f87171" />
                    ) : (
                      <>
                        <Ionicons name="trash-outline" size={18} color="#f87171" />
                        <Text className="text-red-400 font-bold text-base ml-2">Eliminar de la colección</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Botón de cerrar */}
                  <TouchableOpacity 
                    onPress={() => {
                      setSelectedPrenda(null);
                      setSelectedInteraccion(null);
                    }}
                    className="py-3 items-center"
                  >
                    <Text className="text-slate-400 font-semibold">Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
