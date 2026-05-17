import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function GuideScreen({ navigation }) {
  return (
    <View className="flex-1 bg-slate-900 p-6 pt-16">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-white mb-2">Preparación</Text>
        <Text className="text-slate-400 mb-8 text-base">
          Para que nuestra IA calcule tus proporciones exactas, sigue esta guía de indumentaria.
        </Text>

        {/* PERMITIDO */}
        <View className="bg-slate-800 p-5 rounded-2xl mb-6 border border-green-500/30">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">🟢</Text>
            <Text className="text-xl font-bold text-white">Permitido</Text>
          </View>
          <Text className="text-slate-300">
            • Ropa ajustada al cuerpo, telas finas.{'\n'}
            • Remeras básicas o musculosas entalladas.{'\n'}
            • Calzas o pantalones que delineen la silueta real.
          </Text>
        </View>

        {/* PROHIBIDO */}
        <View className="bg-slate-800 p-5 rounded-2xl mb-8 border border-red-500/30">
          <View className="flex-row items-center mb-3">
            <Text className="text-2xl mr-3">🔴</Text>
            <Text className="text-xl font-bold text-white">Prohibido Estrictamente</Text>
          </View>
          <Text className="text-slate-300">
            • Prendas oversize o excesivamente holgadas.{'\n'}
            • Buzos holgados, camperas infladas.{'\n'}
            • Bufandas o cuellos altos que bloqueen el rastreo del cuello y los hombros.
          </Text>
        </View>

      </ScrollView>

      {/* FOOTER ACTION */}
      <TouchableOpacity 
        className="bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-600/50 mb-6"
        onPress={() => navigation.navigate('Verification')}
      >
        <Text className="text-white font-bold text-lg">Entendido, Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}
