import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import GuideScreen from '../screens/Onboarding/GuideScreen';
import VerificationScreen from '../screens/Onboarding/VerificationScreen';
import AssistedCamera from '../screens/Camera/AssistedCamera';
import FeedScreen from '../screens/Feed/FeedScreen';
import ResultScreen from '../screens/Result/ResultScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // UI inmersiva como lo pide el documento
        contentStyle: { backgroundColor: '#0f172a' } // bg-slate-900 (Tailwind oscuro)
      }}
      initialRouteName="Guide"
    >
      {/* FLUJO 1: ONBOARDING */}
      <Stack.Screen name="Guide" component={GuideScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      
      {/* FLUJO 2: CAMARA ASISTIDA */}
      <Stack.Screen name="Camera" component={AssistedCamera} />
      <Stack.Screen name="Result" component={ResultScreen} />
      
      {/* FLUJO 3: DISCOVERY FEED */}
      <Stack.Screen name="Feed" component={FeedScreen} />
    </Stack.Navigator>
  );
}
