import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NODE_API_URL } from '../../../config/config';

type AppStackParamList = {
  Guide: undefined;
};

export default function PerfilScreen() {
  const { user, logoutUser, updateUserContext } = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  // Estados para modo edición básico
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Estados para modo edición seguridad
  const [isEditingSecurity, setIsEditingSecurity] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdateBasic = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const response = await fetch(`${NODE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName, phone })
      });
      const data = await response.json();
      if (response.ok) {
        updateUserContext(data);
        setIsEditingBasic(false);
        Alert.alert('Éxito', 'Información actualizada.');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar perfil');
    }
  };

  const handleUpdateSecurity = async () => {
    if (!currentPassword) {
      Alert.alert('Error', 'Debes ingresar tu contraseña actual para confirmar cambios.');
      return;
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('@token');
      const response = await fetch(`${NODE_API_URL}/api/auth/security`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newEmail, newPassword })
      });
      const data = await response.json();
      
      if (response.ok) {
        if (data.token) {
           await AsyncStorage.setItem('@token', data.token);
        }
        updateUserContext({ ...user!, email: newEmail });
        setIsEditingSecurity(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        Alert.alert('Éxito', 'Información de seguridad actualizada.');
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al actualizar seguridad');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logoutUser }
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-slate-900 px-6 py-10">
      
      {/* Profile Header */}
      <View className="items-center mb-8 mt-10">
        <View className="w-24 h-24 rounded-full bg-neutral-800 border border-neutral-700 items-center justify-center mb-4">
          <Text className="text-4xl text-white font-light">
            {user?.fullName?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-2xl text-white font-bold tracking-wider">{user?.fullName}</Text>
        <Text className="text-neutral-400">@{user?.username}</Text>
      </View>

      {/* Biometría Card */}
      <View className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 mb-6 shadow-xl">
        <Text className="text-white font-semibold uppercase tracking-widest mb-4">Biometría IA</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-neutral-400">Silueta:</Text>
          <Text className="text-white font-bold">{user?.silueta_detectada || 'No calculada'}</Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-neutral-400">Medidas S/W/H:</Text>
          <Text className="text-white font-medium">
            {user?.medidas_morfometricas?.S?.toFixed(1) || '-'} / {user?.medidas_morfometricas?.W?.toFixed(1) || '-'} / {user?.medidas_morfometricas?.H?.toFixed(1) || '-'}
          </Text>
        </View>
        
        <TouchableOpacity 
          className="bg-neutral-800 py-3 rounded-lg items-center border border-neutral-700"
          onPress={() => navigation.navigate('Guide')}
        >
          <Text className="text-white">🔄 Volver a escanear mi cuerpo</Text>
        </TouchableOpacity>
      </View>

      {/* Resumen de Cuenta (Básico) */}
      <View className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-semibold uppercase tracking-widest">Datos Básicos</Text>
          <TouchableOpacity onPress={() => setIsEditingBasic(!isEditingBasic)}>
            <Text className="text-blue-400">{isEditingBasic ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {isEditingBasic ? (
          <View className="space-y-4">
            <TextInput
              className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-3 rounded-lg"
              placeholder="Nombre Completo"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-3 rounded-lg"
              placeholder="Teléfono"
              placeholderTextColor="#9ca3af"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity className="bg-white py-3 rounded-lg items-center mt-2" onPress={handleUpdateBasic}>
              <Text className="text-black font-semibold">Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-2">
            <Text className="text-neutral-400">Nombre: <Text className="text-white">{user?.fullName}</Text></Text>
            <Text className="text-neutral-400">Teléfono: <Text className="text-white">{user?.phone || '-'}</Text></Text>
          </View>
        )}
      </View>

      {/* Seguridad Card */}
      <View className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white font-semibold uppercase tracking-widest">Seguridad</Text>
          <TouchableOpacity onPress={() => setIsEditingSecurity(!isEditingSecurity)}>
            <Text className="text-blue-400">{isEditingSecurity ? 'Cancelar' : 'Editar'}</Text>
          </TouchableOpacity>
        </View>

        {isEditingSecurity ? (
          <View className="space-y-4">
            <View className="relative">
              <TextInput
                className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-3 rounded-lg pr-16"
                placeholder="Contraseña Actual (Obligatoria)"
                placeholderTextColor="#ef4444"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity 
                className="absolute right-4 top-3.5"
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Text className="text-indigo-400 font-semibold">{showCurrentPassword ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-3 rounded-lg"
              placeholder="Nuevo Correo Electrónico"
              placeholderTextColor="#9ca3af"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View className="relative">
              <TextInput
                className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-3 rounded-lg pr-16"
                placeholder="Nueva Contraseña (Opcional)"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity 
                className="absolute right-4 top-3.5"
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Text className="text-indigo-400 font-semibold">{showNewPassword ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>

            {newPassword.length > 0 && (
              <View className="relative">
                <TextInput
                  className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-3 rounded-lg pr-16"
                  placeholder="Confirmar Nueva Contraseña"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                />
                <TouchableOpacity 
                  className="absolute right-4 top-3.5"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text className="text-indigo-400 font-semibold">{showConfirmPassword ? 'Ocultar' : 'Ver'}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity className="bg-white py-3 rounded-lg items-center mt-2" onPress={handleUpdateSecurity}>
              <Text className="text-black font-semibold">Actualizar Seguridad</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-2">
            <Text className="text-neutral-400">Correo: <Text className="text-white">{user?.email}</Text></Text>
            <Text className="text-neutral-400">Contraseña: <Text className="text-white">********</Text></Text>
          </View>
        )}
      </View>

      {/* Danger Zone */}
      <View className="mb-12 border-t border-neutral-800 pt-6">
        <TouchableOpacity 
          className="bg-neutral-800/50 py-4 rounded-xl items-center border border-red-900/50 mb-4"
          onPress={handleLogout}
        >
          <Text className="text-red-500 font-semibold uppercase tracking-wider">Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}
