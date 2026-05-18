import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * ------------------------------------------------------------------------------------------------
 * 🛠️ TODO: PREPARACIÓN PARA LIBRERÍAS NATIVAS
 * ------------------------------------------------------------------------------------------------
 * Para conectar esta vista con los sensores de hardware reales (cuando se salga de la fase prototipo):
 * 
 * 1. GIROSCOPIO (Estabilidad):
 *    - Instalar: `npm install react-native-sensors`
 *    - Implementación: 
 *      import { gyroscope } from 'react-native-sensors';
 *      gyroscope.subscribe(({ x, y, z }) => {
 *         const movement = Math.abs(x) + Math.abs(y) + Math.abs(z);
 *         setIsStable(movement < UMBRAL_TOLERANCIA); 
 *      });
 * 
 * 2. CÁMARA y EXPOSICIÓN (Iluminación frontal):
 *    - Instalar: `react-native-vision-camera` o `expo-camera`.
 *    - Implementación: Al usar un frame processor (vision-camera), se puede calcular la luminosidad
 *      promedio del frame (pixels). Alternativamente, muchas APIs exponen el ISO y exposición nativa.
 *      if (luminosidadPromedio > UMBRAL_MINIMO_LUZ) setIsWellLit(true);
 * ------------------------------------------------------------------------------------------------
 */

export default function AssistedCamera({ navigation }) {
  // Estados para simular los sensores del teléfono
  const [isWellLit, setIsWellLit] = useState(false);
  const [isStable, setIsStable] = useState(false);

  // Simulación temporal de sensores cambiantes
  useEffect(() => {
    const sensorInterval = setInterval(() => {
      // Simula fluctuaciones leyendo el entorno (cambian aleatoriamente para prototipo)
      setIsWellLit(Math.random() > 0.3); // 70% de las veces está bien iluminado
      setIsStable(Math.random() > 0.4);  // 60% de las veces está estable
    }, 1500);

    return () => clearInterval(sensorInterval);
  }, []);

  const handleCapture = () => {
    // Solo se permite capturar si ambos semáforos están en verde
    if (isWellLit && isStable) {
      console.log('📸 Foto capturada correctamente. Enviando a IA para extracción de variables S, W, H...');
      // Navegamos al Feed simulando que el backend ya respondió con la silueta
      navigation.replace('Feed');
    }
  };

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {/* SIMULACIÓN DE LA VISTA DE LA CÁMARA (Fondo Gris oscuro simulando video) */}
      <View className="absolute inset-0 bg-slate-800" />

      {/* OVERLAY: Silueta Guía Translúcida */}
      <View className="border-2 border-indigo-500/50 w-2/3 h-2/3 rounded-[100px] border-dashed justify-center items-center absolute">
        <Text className="text-indigo-400/50 text-center font-bold">SILUETA{'\n'}GUÍA</Text>
      </View>

      {/* SEMÁFORO DE VALIDACIÓN EN TIEMPO REAL */}
      <View className="absolute top-16 w-full px-6 flex-row justify-between">
        <View className={`px-4 py-2 rounded-full flex-row items-center ${isWellLit ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <Text className="mr-2">{isWellLit ? '🟢' : '🔴'}</Text>
          <Text className={`font-bold ${isWellLit ? 'text-green-400' : 'text-red-400'}`}>
            {isWellLit ? 'Luz Óptima' : 'Baja Luz / Contraluz'}
          </Text>
        </View>

        <View className={`px-4 py-2 rounded-full flex-row items-center ${isStable ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <Text className="mr-2">{isStable ? '🟢' : '🔴'}</Text>
          <Text className={`font-bold ${isStable ? 'text-green-400' : 'text-red-400'}`}>
            {isStable ? 'Estable' : 'Movimiento (Blur)'}
          </Text>
        </View>
      </View>

      {/* MENSAJE DE AYUDA CONTEXTUAL */}
      {(!isWellLit || !isStable) && (
        <View className="absolute bottom-40 bg-black/70 px-6 py-3 rounded-2xl">
          <Text className="text-white text-center font-semibold">
            {!isWellLit ? 'Necesitas más luz frontal para continuar.' : 'Mantén el teléfono firme.'}
          </Text>
        </View>
      )}

      {/* BOTÓN DE CAPTURA (Lógica de Bloqueo) */}
      <TouchableOpacity
        className={`absolute bottom-12 w-20 h-20 rounded-full border-4 items-center justify-center
          ${isWellLit && isStable ? 'border-white bg-indigo-500' : 'border-slate-600 bg-slate-800 opacity-50'}`}
        disabled={!isWellLit || !isStable}
        onPress={handleCapture}
      >
        <View className={`w-14 h-14 rounded-full ${isWellLit && isStable ? 'bg-white' : 'bg-slate-600'}`} />
      </TouchableOpacity>
    </View>
  );
}
