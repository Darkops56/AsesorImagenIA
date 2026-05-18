import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

// ⚠️ IMPORTANTE: Si pruebas en un dispositivo físico, cambia "localhost" por la IP local de tu computadora (ej: 192.168.1.55)
// Si usas el emulador de Android localmente, "10.0.2.2" suele funcionar.
const AI_API_URL = 'http://192.168.1.X:8000/api/vision/process-frame'; 
const NODE_API_URL = 'http://192.168.1.X:3000/api/morphology/calculate';

export default function AssistedCamera({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef(null);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const processImage = async (base64Str) => {
    setIsProcessing(true);
    try {
      // 1. Enviar foto al backend de Python (IA)
      const aiResponse = await fetch(AI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Str })
      });
      
      const aiData = await aiResponse.json();
      
      // Validación de Calidad (Nitidez y Brillo)
      if (aiData.status === 'quality_error') {
        Alert.alert(
          'Foto rechazada por la IA 🤖', 
          `${aiData.message}\n\nPor favor, intenta tomar otra foto en un lugar mejor iluminado y mantén la cámara firme.`
        );
        setIsProcessing(false);
        return;
      }
      
      if (!aiResponse.ok || aiData.status !== 'success') {
        throw new Error(aiData.detail || aiData.message || 'Error en el servidor de IA');
      }
      
      const { S, W, H } = aiData.data.morfologia_corporal;
      
      // 2. Enviar medidas al backend en Node.js
      const nodeResponse = await fetch(NODE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ S, W, H }) // Modo invitado (sin usuarioId)
      });
      
      const nodeData = await nodeResponse.json();
      
      if (!nodeResponse.ok) {
        throw new Error(nodeData.error || 'Error en el servidor de Node.js');
      }
      
      Alert.alert('¡Análisis Exitoso! 🎉', `Tu silueta ha sido clasificada como: ${nodeData.silueta}`);
      
      // 3. Navegar a la siguiente pantalla
      navigation.replace('Feed');

    } catch (error) {
      console.error(error);
      Alert.alert('Error de conexión', 'No se pudo conectar con los servidores. Verifica las URLs y tu conexión a internet.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
        if (photo.base64) {
          await processImage(photo.base64);
        }
      } catch (e) {
        Alert.alert('Error', 'No se pudo capturar la foto.');
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        base64: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64 = result.assets[0].base64;
        if (base64) {
          await processImage(base64);
        }
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo cargar la imagen de la galería.');
    }
  };

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-black justify-center items-center px-6">
        <Text className="text-white text-center mb-4 text-lg">Necesitamos tu permiso para mostrar la cámara</Text>
        <TouchableOpacity className="bg-indigo-600 px-6 py-3 rounded-full" onPress={requestPermission}>
          <Text className="text-white font-bold">Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        
        {/* Capa de Carga y Bloqueo */}
        {isProcessing && (
          <View className="absolute z-50 w-full h-full bg-black/80 justify-center items-center">
            <ActivityIndicator size="large" color="#6366f1" />
            <Text className="text-white font-bold mt-4 text-lg">Validando calidad con IA...</Text>
          </View>
        )}

        <View className="flex-1 justify-center items-center relative">
          
          {/* OVERLAY: Silueta Guía Translúcida */}
          <View className="border-2 border-indigo-500/50 w-2/3 h-2/3 rounded-[100px] border-dashed justify-center items-center absolute pointer-events-none">
            <Text className="text-indigo-400/50 text-center font-bold">SILUETA{'\n'}GUÍA</Text>
          </View>

          {/* MENSAJE DE AYUDA CONTEXTUAL */}
          <View className="absolute top-16 bg-black/60 px-6 py-2 rounded-full">
            <Text className="text-white text-center font-semibold">
              Ubícate dentro de la silueta con buena iluminación
            </Text>
          </View>

          {/* BOTONES DE CONTROL INFERIORES */}
          <View className="absolute bottom-10 w-full flex-row justify-around items-center px-6">
            
            {/* Botón de Galería */}
            <TouchableOpacity 
              className="bg-slate-800/80 p-4 rounded-full border border-slate-600"
              onPress={handlePickImage}
            >
              <Text className="text-white text-xs font-bold">GALERÍA</Text>
            </TouchableOpacity>

            {/* Botón de Captura */}
            <TouchableOpacity
              className="w-20 h-20 rounded-full border-4 border-white bg-indigo-500 items-center justify-center shadow-lg shadow-indigo-500/50"
              onPress={handleCapture}
            >
              <View className="w-14 h-14 rounded-full bg-white" />
            </TouchableOpacity>

            {/* Botón de Voltear Cámara */}
            <TouchableOpacity 
              className="bg-slate-800/80 p-4 rounded-full border border-slate-600"
              onPress={toggleCameraFacing}
            >
              <Text className="text-white text-xs font-bold">VOLTEAR</Text>
            </TouchableOpacity>
          </View>

        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    width: '100%',
  },
});
