import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { AI_API_URL, NODE_API_URL } from '../../../config/config';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { validateImageQuality } from '../../utils/imageValidation';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
export default function AssistedCamera({ navigation }) {
  const { user, updateUserContext } = useContext(AuthContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const cameraRef = useRef(null);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const processImage = async (base64Str) => {
    setIsProcessing(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    
    try {
      // 1. Enviar foto al backend de Python (IA)
      const aiResponse = await fetch(`${AI_API_URL}/api/vision/process-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64Str }),
        signal: controller.signal
      });
      
      const aiResponseText = await aiResponse.text();
      let aiData;
      try {
        aiData = JSON.parse(aiResponseText);
      } catch (parseError) {
        console.error("AI API Error Response (Not JSON):", aiResponseText.substring(0, 500));
        throw new Error(`AI API devolvió un formato inválido (HTTP ${aiResponse.status}): ${aiResponseText.substring(0, 100)}...`);
      }
      
      // Validación de Calidad (Nitidez y Brillo)
      if (aiData.status === 'quality_error') {
        Alert.alert(
          'Foto rechazada por la IA 🤖', 
          `${aiData.message}\n\nPor favor, intenta tomar otra foto en un lugar mejor iluminado y mantén la cámara firme.`
        );
        return;
      }

      // Validación de Encuadre y Restricciones
      if (typeof aiData.error === 'string') {
        Alert.alert(
          'Error de Encuadre 📏', 
          aiData.error
        );
        return;
      }
      
      if (!aiResponse.ok || aiData.status !== 'success') {
        throw new Error(aiData.detail || aiData.message || 'Error en el servidor de IA');
      }
      
      const { S, W, H } = aiData.data.morfologia_corporal;
      
      // 2. Enviar medidas al backend en Node.js
      const nodeResponse = await fetch(`${NODE_API_URL}/api/morphology/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: user?._id || null, S, W, H }), // Enviar usuarioId si está autenticado
        signal: controller.signal
      });
      
      const nodeResponseText = await nodeResponse.text();
      let nodeData;
      try {
        nodeData = JSON.parse(nodeResponseText);
      } catch (parseError) {
        console.error("Node API Error Response (Not JSON):", nodeResponseText.substring(0, 500));
        throw new Error(`Node API devolvió un formato inválido (HTTP ${nodeResponse.status}): ${nodeResponseText.substring(0, 100)}...`);
      }
      
      if (!nodeResponse.ok) {
        throw new Error(nodeData.error || 'Error en el servidor de Node.js');
      }

      // Si el backend devuelve un usuario actualizado, actualizar el contexto global
      if (nodeData.usuario) {
        updateUserContext(nodeData.usuario);
      }
      
      Alert.alert('¡Análisis Exitoso! 🎉', `Tu silueta ha sido clasificada como: ${nodeData.silueta}`);
      
      // 3. Navegar a la pantalla de resultados
      navigation.navigate('Result', { silueta: nodeData.silueta, imageBase64: base64Str });

    } catch (error: any) {
      console.error(error);
      if (error.name === 'AbortError') {
        Alert.alert('Tiempo agotado ⏳', 'El servidor tardó demasiado en responder. Por favor, intenta de nuevo.');
      } else {
        Alert.alert('Error de procesamiento', error.message || 'No se pudo conectar con los servidores.');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsProcessing(false);
    }
  };

  const handleCapture = async () => {
    if (cameraRef.current && !isProcessing && countdown === null) {
      // Temporizador Físico (Anti-Motion Blur)
      for (let i = 3; i > 0; i--) {
        setCountdown(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(null);

      try {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
        if (photo.base64 && photo.uri) {
          setIsProcessing(true);
          
          let base64ToProcess = photo.base64;

          try {
            // Resize image to fixed height for payload reduction
            const manipResult = await ImageManipulator.manipulateAsync(
              photo.uri,
              [{ resize: { height: 800 } }],
              { base64: true, compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            if (manipResult.base64) {
              base64ToProcess = manipResult.base64;
              const quality = await validateImageQuality(manipResult.base64);
              console.log("Image Quality:", quality);

              if (quality.isDark) {
                Alert.alert('Foto muy oscura 🌑', 'Por favor, ubícate en un lugar con mejor iluminación.');
                setIsProcessing(false);
                return;
              }

              if (quality.isOverexposed) {
                Alert.alert('Foto sobreexpuesta ☀️', 'Hay demasiada luz. Por favor, evita reflejos directos.');
                setIsProcessing(false);
                return;
              }

              if (quality.isBlurry) {
                Alert.alert('Foto borrosa 📷', 'Por favor, mantén la cámara firme al tomar la foto.');
                setIsProcessing(false);
                return;
              }
            }
          } catch (validationError) {
            console.error("Error during local validation/manipulation:", validationError);
            // Si la validación local falla por alguna razón (ej. buffer error), 
            // continuamos con el procesamiento normal para no bloquear.
          }

          // If validation passes (or fails to run but doesn't throw specific quality errors), process it
          await processImage(base64ToProcess);
        }
      } catch (e) {
        setIsProcessing(false);
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

        {/* Capa de Cuenta Regresiva */}
        {countdown !== null && (
          <View className="absolute z-50 w-full h-full bg-black/50 justify-center items-center">
            <Text className="text-white font-bold text-[120px]">{countdown}</Text>
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
