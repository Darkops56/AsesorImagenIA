import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { NODE_API_URL } from '../../config/config';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FormularioPrendaPropia({ visible, onClose, onSuccess }: Props) {
  const { user, token } = useContext(AuthContext);
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState<'Superior' | 'Inferior' | 'Calzado' | 'Accesorio'>('Superior');
  const [color, setColor] = useState('');
  
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setImageUri(null);
    setImageBase64(null);
    setNombre('');
    setCategoria('Superior');
    setColor('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.7,
        base64: true,
      };

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 || null);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo cargar la imagen.');
    }
  };

  const handleSubmit = async () => {
    if (!imageBase64) {
      Alert.alert('Falta imagen', 'Por favor toma una foto o selecciona una de la galería.');
      return;
    }
    if (!nombre.trim()) {
      Alert.alert('Falta nombre', 'Por favor asigna un nombre a la prenda.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nombre,
        categoria,
        metadata: {
          color_dominante: color || 'Neutro'
        },
        image_base64: `data:image/jpeg;base64,${imageBase64}`
      };

      const response = await fetch(`${NODE_API_URL}/api/prendas/user-owned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 201) {
        Alert.alert('¡Éxito!', 'Tu prenda se guardó y ya es parte de tu Armario Virtual.');
        handleClose();
        onSuccess();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.error || 'No se pudo guardar la prenda.');
      }
    } catch (error) {
      console.error('Error guardando prenda:', error);
      Alert.alert('Error', 'Hubo un problema de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/80"
      >
        <View className="bg-slate-900 rounded-t-3xl p-6 h-[85%] border-t border-slate-800">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white text-xl font-bold">Agregar a mi Armario</Text>
            <TouchableOpacity onPress={handleClose} className="p-2 bg-slate-800 rounded-full">
              <Ionicons name="close" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Controles de Imagen */}
            <View className="items-center mb-6">
              {imageUri ? (
                <View className="relative w-40 h-52 rounded-2xl overflow-hidden border border-slate-700">
                  <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                  <TouchableOpacity 
                    onPress={() => { setImageUri(null); setImageBase64(null); }}
                    className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                  >
                    <Ionicons name="trash" size={16} color="#f87171" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="w-full flex-row justify-between space-x-4">
                  <TouchableOpacity 
                    onPress={() => pickImage(true)}
                    className="flex-1 bg-slate-800 rounded-2xl p-6 items-center justify-center border border-slate-700"
                  >
                    <Ionicons name="camera" size={32} color="#818cf8" />
                    <Text className="text-slate-300 font-medium mt-2">Cámara</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => pickImage(false)}
                    className="flex-1 bg-slate-800 rounded-2xl p-6 items-center justify-center border border-slate-700"
                  >
                    <Ionicons name="image" size={32} color="#818cf8" />
                    <Text className="text-slate-300 font-medium mt-2">Galería</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Formulario */}
            <View className="space-y-4">
              <View>
                <Text className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-bold">Nombre</Text>
                <TextInput 
                  className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700"
                  placeholder="Ej: Chaqueta de Cuero Negra"
                  placeholderTextColor="#64748b"
                  value={nombre}
                  onChangeText={setNombre}
                />
              </View>

              <View>
                <Text className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-bold">Categoría</Text>
                <View className="flex-row space-x-4">
                  <TouchableOpacity 
                    onPress={() => setCategoria('Superior')}
                    className={`flex-1 py-3 items-center rounded-xl border ${categoria === 'Superior' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <Text className={`font-bold ${categoria === 'Superior' ? 'text-white' : 'text-slate-400'}`}>Superior</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setCategoria('Inferior')}
                    className={`flex-1 py-3 items-center rounded-xl border ${categoria === 'Inferior' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <Text className={`font-bold ${categoria === 'Inferior' ? 'text-white' : 'text-slate-400'}`}>Inferior</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setCategoria('Calzado')}
                    className={`flex-1 py-3 items-center rounded-xl border ${categoria === 'Calzado' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <Text className={`font-bold ${categoria === 'Calzado' ? 'text-white' : 'text-slate-400'}`}>Calzado</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setCategoria('Accesorio')}
                    className={`flex-1 py-3 items-center rounded-xl border ${categoria === 'Accesorio' ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}
                  >
                    <Text className={`font-bold ${categoria === 'Accesorio' ? 'text-white' : 'text-slate-400'}`}>Accesorio</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-bold">Color Principal (Opcional)</Text>
                <TextInput 
                  className="bg-slate-800 text-white p-4 rounded-xl border border-slate-700"
                  placeholder="Ej: Negro, Rojo, Azul Marino..."
                  placeholderTextColor="#64748b"
                  value={color}
                  onChangeText={setColor}
                />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={loading}
              className={`mt-8 py-4 rounded-xl items-center flex-row justify-center ${loading ? 'bg-indigo-600/50' : 'bg-indigo-600'}`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="#fff" />
                  <Text className="text-white font-bold text-lg ml-2">Guardar Prenda</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
