import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AuthStackParamList = {
  Login: undefined;
};

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const { registerUser } = useContext(AuthContext);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const validateField = (field: string, value: string) => {
    let error = '';
    if (field === 'fullName' && !value) error = 'El nombre es obligatorio.';
    if (field === 'username' && !value) error = 'El usuario es obligatorio.';
    if (field === 'email') {
      if (!value) error = 'El correo es obligatorio.';
      else if (!/\S+@\S+\.\S+/.test(value)) error = 'Ingresa un correo válido.';
    }
    if (field === 'password') {
      if (!value) error = 'La contraseña es obligatoria.';
      else if (value.length < 6) error = 'Debe tener al menos 6 caracteres.';
    }
    if (field === 'confirmPassword') {
      if (value !== password) error = 'Las contraseñas no coinciden.';
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleRegister = async () => {
    // Validar todo antes de enviar
    const currentErrors = {
      fullName: !fullName ? 'El nombre es obligatorio.' : '',
      username: !username ? 'El usuario es obligatorio.' : '',
      email: !email ? 'El correo es obligatorio.' : (!/\S+@\S+\.\S+/.test(email) ? 'Ingresa un correo válido.' : ''),
      password: !password ? 'La contraseña es obligatoria.' : (password.length < 6 ? 'Debe tener al menos 6 caracteres.' : ''),
      confirmPassword: confirmPassword !== password ? 'Las contraseñas no coinciden.' : ''
    };

    setErrors(currentErrors);

    if (Object.values(currentErrors).some(err => err !== '')) {
      Alert.alert('Error', 'Por favor corrige los errores antes de continuar.');
      return;
    }
    
    try {
      await registerUser({ fullName, username, email, phone, password });
      // AppNavigator redirigirá automáticamente a GuideScreen al detectar autenticación sin silueta
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 40 }}>
        <View className="mb-10 items-center mt-10">
          <Text className="text-4xl font-bold text-white tracking-widest uppercase mb-2">Registro</Text>
          <Text className="text-neutral-400 text-center">Crea tu identidad digital</Text>
        </View>

        <View className="space-y-4">
          <View>
            <TextInput
              className={`w-full bg-neutral-800/50 border ${errors.fullName ? 'border-red-500' : 'border-neutral-700'} text-white px-4 py-4 rounded-xl`}
              placeholder="Nombre Completo (Ej: Juan Perez) *"
              placeholderTextColor="#9ca3af"
              value={fullName}
              onChangeText={(text) => { setFullName(text); if (errors.fullName) validateField('fullName', text); }}
              onBlur={() => validateField('fullName', fullName)}
            />
            {errors.fullName ? <Text className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</Text> : null}
          </View>

          <View>
            <TextInput
              className={`w-full bg-neutral-800/50 border ${errors.username ? 'border-red-500' : 'border-neutral-700'} text-white px-4 py-4 rounded-xl`}
              placeholder="Usuario (Ej: juanperez123) *"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              value={username}
              onChangeText={(text) => { setUsername(text); if (errors.username) validateField('username', text); }}
              onBlur={() => validateField('username', username)}
            />
            {errors.username ? <Text className="text-red-500 text-xs mt-1 ml-1">{errors.username}</Text> : null}
          </View>

          <View>
            <TextInput
              className={`w-full bg-neutral-800/50 border ${errors.email ? 'border-red-500' : 'border-neutral-700'} text-white px-4 py-4 rounded-xl`}
              placeholder="Correo Electrónico (Ej: correo@gmail.com) *"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => { setEmail(text); if (errors.email) validateField('email', text); }}
              onBlur={() => validateField('email', email)}
            />
            {errors.email ? <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text> : null}
          </View>
          
          <View>
            <TextInput
              className="w-full bg-neutral-800/50 border border-neutral-700 text-white px-4 py-4 rounded-xl"
              placeholder="Teléfono (Opcional)"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View>
            <View className="relative">
              <TextInput
                className={`w-full bg-neutral-800/50 border ${errors.password ? 'border-red-500' : 'border-neutral-700'} text-white px-4 py-4 rounded-xl pr-16`}
                placeholder="Contraseña *"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => { setPassword(text); if (errors.password) validateField('password', text); }}
                onBlur={() => validateField('password', password)}
              />
              <TouchableOpacity 
                className="absolute right-4 top-4"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className="text-indigo-400 font-semibold">{showPassword ? 'Ocultar' : 'Ver'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text> : null}
          </View>

          <View>
            <View className="relative">
              <TextInput
                className={`w-full bg-neutral-800/50 border ${errors.confirmPassword ? 'border-red-500' : 'border-neutral-700'} text-white px-4 py-4 rounded-xl pr-16`}
                placeholder="Repetir Contraseña *"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) validateField('confirmPassword', text); }}
                onBlur={() => validateField('confirmPassword', confirmPassword)}
              />
            </View>
            {errors.confirmPassword ? <Text className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</Text> : null}
          </View>

          <TouchableOpacity 
            className="w-full bg-white py-4 rounded-xl items-center mt-6"
            onPress={handleRegister}
          >
            <Text className="text-black font-semibold text-lg uppercase tracking-wider">Crear Cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="mt-4 items-center mb-10"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="text-neutral-400">¿Ya tienes cuenta? <Text className="text-white font-bold">Inicia Sesión</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
