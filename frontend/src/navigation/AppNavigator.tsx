import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

// App Screens
import GuideScreen from '../screens/Onboarding/GuideScreen';
import VerificationScreen from '../screens/Onboarding/VerificationScreen';
import AssistedCamera from '../screens/Camera/AssistedCamera';
import FeedScreen from '../screens/Feed/FeedScreen';
import ResultScreen from '../screens/Result/ResultScreen';
import ArmarioScreen from '../screens/Armario/ArmarioScreen';
import PerfilScreen from '../screens/Profile/PerfilScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0f172a' }
      }}
      initialRouteName={isAuthenticated ? (user?.silueta_detectada ? "Feed" : "Guide") : "Login"}
    >
      {!isAuthenticated ? (
        // FLUJO DE AUTENTICACIÓN
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // FLUJO DE APLICACIÓN
        <>
          <Stack.Screen name="Guide" component={GuideScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="Camera" component={AssistedCamera} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen name="Feed" component={FeedScreen} />
          <Stack.Screen name="Armario" component={ArmarioScreen} />
          <Stack.Screen name="Perfil" component={PerfilScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
