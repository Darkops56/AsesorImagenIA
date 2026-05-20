import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
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
import ExplorarScreen from '../screens/Explorar/ExplorarScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#334155' },
        tabBarActiveTintColor: '#818cf8',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explorar') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Armario') {
            iconName = focused ? 'shirt' : 'shirt-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explorar" component={ExplorarScreen} />
      <Tab.Screen name="Armario" component={ArmarioScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

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
      initialRouteName={isAuthenticated ? (user?.silueta_detectada ? "MainTabs" : "Guide") : "Login"}
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
          {user?.silueta_detectada ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : null}
          <Stack.Screen name="Guide" component={GuideScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
          <Stack.Screen name="Camera" component={AssistedCamera} />
          <Stack.Screen name="Result" component={ResultScreen} />
          {!user?.silueta_detectada ? (
            <Stack.Screen name="MainTabs" component={MainTabs} />
          ) : null}
        </>
      )}
    </Stack.Navigator>
  );
}
