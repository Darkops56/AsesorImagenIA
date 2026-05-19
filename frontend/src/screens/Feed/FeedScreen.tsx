import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { NODE_API_URL } from '../../../config/config';

interface Prenda {
  id_prenda: string;
  nombre: string;
  categoria: string;
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

export default function FeedScreen({ route, navigation }: any) {
  const { silueta } = route?.params || {};
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [swipedAll, setSwipedAll] = useState(false);

  useEffect(() => {
    fetchPrendas();
  }, []);

  const fetchPrendas = async () => {
    try {
      const url = silueta 
        ? `${NODE_API_URL}/api/prendas?silueta=${encodeURIComponent(silueta)}` 
        : `${NODE_API_URL}/api/prendas`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error en la red al recuperar prendas');
      }
      const data = await response.json();
      setPrendas(data);
    } catch (error) {
      console.error('Error fetching prendas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (cardIndex: number) => {
    const prenda = prendas[cardIndex];
    if (prenda) {
      console.log(`[LIKE] Te gustó: ${prenda.nombre}`);
    }
  };

  const handlePass = (cardIndex: number) => {
    const prenda = prendas[cardIndex];
    if (prenda) {
      console.log(`[PASS] Descartaste: ${prenda.nombre}`);
    }
  };

  const renderCard = (prenda: Prenda) => {
    if (!prenda) return <View />;

    return (
      <View className="flex-1 mt-4 mb-20 bg-slate-800 rounded-3xl shadow-lg overflow-hidden border border-slate-700">
        <Image
          source={{ uri: prenda.metadata?.url_imagen || 'https://via.placeholder.com/400x600' }}
          className="w-full h-3/5"
          resizeMode="cover"
        />
        <View className="p-6 flex-1 justify-between">
          <View>
            <Text className="text-3xl text-white font-bold mb-2">{prenda.nombre}</Text>
            <Text className="text-lg text-indigo-400 font-semibold mb-4 uppercase tracking-wider">{prenda.categoria}</Text>
            
            <View className="flex-row flex-wrap gap-2">
              {prenda.atributos_diseno?.corte && (
                <View className="bg-slate-700 px-3 py-1 rounded-full">
                  <Text className="text-slate-300 text-sm">{prenda.atributos_diseno.corte}</Text>
                </View>
              )}
              {prenda.metadata?.color_dominante && (
                <View className="bg-slate-700 px-3 py-1 rounded-full">
                  <Text className="text-slate-300 text-sm">{prenda.metadata.color_dominante}</Text>
                </View>
              )}
              {prenda.atributos_diseno?.tipo_cuello && (
                <View className="bg-slate-700 px-3 py-1 rounded-full">
                  <Text className="text-slate-300 text-sm">{prenda.atributos_diseno.tipo_cuello}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
      <TouchableOpacity 
        className="absolute top-12 left-6 p-3 bg-slate-800/80 rounded-full flex-row items-center z-50"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white text-xl font-bold">←</Text>
      </TouchableOpacity>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#818cf8" />
          <Text className="text-slate-400 mt-4 text-lg">Cargando catálogo...</Text>
        </View>
      ) : swipedAll || prendas.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-2xl text-slate-300 text-center font-medium">
            No hay más prendas por hoy.
          </Text>
          <Text className="text-slate-500 mt-2 text-center">
            Vuelve pronto para descubrir nuevas tendencias.
          </Text>
        </View>
      ) : (
        <Swiper
          cards={prendas}
          renderCard={renderCard}
          onSwipedRight={handleLike}
          onSwipedLeft={handlePass}
          onSwipedAll={() => setSwipedAll(true)}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          verticalSwipe={false}
          animateCardOpacity
          overlayLabels={{
            left: {
              title: 'NOPE',
              style: {
                label: {
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: 32,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: 10,
                  overflow: 'hidden'
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 40,
                  marginLeft: -40
                }
              }
            },
            right: {
              title: 'LIKE',
              style: {
                label: {
                  backgroundColor: '#22c55e',
                  color: '#ffffff',
                  fontSize: 32,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: 10,
                  overflow: 'hidden'
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 40,
                  marginLeft: 40
                }
              }
            }
          }}
        />
      )}
    </View>
  );
}
