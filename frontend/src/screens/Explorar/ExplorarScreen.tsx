import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, ScrollView, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { NODE_API_URL } from '../../../config/config';

interface Prenda {
  _id: string;
  id_prenda: string;
  nombre: string;
  categoria: string;
  siluetas_compatibles?: string[];
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

  const renderItem = ({ item }: { item: Prenda }) => {
    const isMatch = user?.silueta_detectada && item.siluetas_compatibles?.includes(user.silueta_detectada);

    return (
      <TouchableOpacity 
        className="flex-1 m-2 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700"
        onPress={() => navigation.navigate('Feed', { seedPrendaId: item._id, seedCategoria: item.categoria })}
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
    </View>
  );
}
