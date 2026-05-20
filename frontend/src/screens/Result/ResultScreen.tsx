import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function ResultScreen({ route, navigation }) {
  const { silueta, imageBase64 } = route.params || {};

  return (
    <View className="flex-1 bg-slate-900 items-center justify-center p-6">
      <TouchableOpacity 
        className="absolute top-12 left-6 p-3 bg-slate-800 rounded-full flex-row items-center z-10"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white text-xl font-bold">←</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-white text-center mb-6 mt-10">Resultado del Análisis</Text>
      
      {imageBase64 ? (
        <View className="mb-8 border-4 border-indigo-500 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/50">
          <Image 
            source={{ uri: `data:image/jpeg;base64,${imageBase64}` }} 
            style={{ width: 250, height: 350 }} 
            resizeMode="cover"
          />
        </View>
      ) : (
        <View className="mb-8 w-[250px] h-[350px] bg-slate-800 rounded-xl items-center justify-center">
          <Text className="text-slate-500">No hay imagen</Text>
        </View>
      )}

      <View className="bg-slate-800 p-6 rounded-2xl w-full items-center border border-slate-700">
        <Text className="text-slate-400 text-lg mb-2">Silueta Detectada:</Text>
        <Text className="text-indigo-400 font-bold text-2xl text-center">
          {silueta ? silueta : "No detectada"}
        </Text>
      </View>
      
      <TouchableOpacity 
        className="mt-8 bg-indigo-600 px-8 py-4 rounded-full w-full shadow-lg shadow-indigo-600/50"
        onPress={() => navigation.navigate('MainTabs', { screen: 'Feed', params: { silueta } })}
      >
        <Text className="text-white text-center font-bold text-lg">Ir al Feed</Text>
      </TouchableOpacity>
    </View>
  );
}
