import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function VerificationScreen({ navigation }) {
  return (
    <View className="flex-1 bg-slate-900 p-6 justify-center">
      
      <View className="items-center mb-10">
        <Text className="text-5xl mb-4">📸</Text>
        <Text className="text-3xl font-bold text-white text-center mb-4">Verificación del Entorno</Text>
        <Text className="text-slate-400 text-center text-lg leading-7">
          Colócate frente a una pared de fondo liso que contraste con el color de tu ropa actual. {'\n\n'}
          Asegúrate de tener una fuente de luz frontal uniforme.
        </Text>
      </View>

      <View className="bg-indigo-500/10 p-5 rounded-2xl mb-12">
        <Text className="text-indigo-300 text-sm text-center">
          Para tu seguridad, tus fotos se procesan en tiempo real en la memoria del sistema y se destruyen de inmediato. No almacenamos imágenes de tu cuerpo en ningún servidor.
        </Text>
      </View>

      <TouchableOpacity 
        className="bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-600/50"
        onPress={() => navigation.navigate('Camera')}
      >
        <Text className="text-white font-bold text-lg">¡Listo, abrir cámara!</Text>
      </TouchableOpacity>
    </View>
  );
}
