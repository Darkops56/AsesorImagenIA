import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Register: undefined;
  Feed: undefined;
  Guide: undefined;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, user } = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    
    try {
      await loginUser({ email, password });
      // La navegación ahora la manejará el AppNavigator o la evaluamos aquí.
      // Wait, let's let AppNavigator handle the authenticated state switch.
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Credenciales incorrectas');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900 justify-center px-8"
    >
      <View className="mb-10 items-center">
        <Text className="text-4xl font-bold text-white tracking-widest uppercase mb-2">Login</Text>
        <Text className="text-neutral-400 text-center">Accede a tu asesor personal de alta costura</Text>
      </View>

      <View className="space-y-4">
        <TextInput
          className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-4 rounded-xl"
          placeholder="Correo Electrónico (Ej: correo@gmail.com)"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        
        <View className="relative">
          <TextInput
            className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-4 rounded-xl pr-16"
            placeholder="Contraseña"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            className="absolute right-4 top-4"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text className="text-indigo-400 font-semibold">{showPassword ? 'Ocultar' : 'Ver'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="w-full bg-white py-4 rounded-xl items-center mt-6"
          onPress={handleLogin}
        >
          <Text className="text-black font-semibold text-lg uppercase tracking-wider">Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="mt-4 items-center"
          onPress={() => navigation.navigate('Register')}
        >
          <Text className="text-neutral-400">¿No tienes cuenta? <Text className="text-white font-bold">Regístrate</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
