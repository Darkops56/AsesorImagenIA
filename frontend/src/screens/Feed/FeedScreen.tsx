import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function FeedScreen({ navigation }) {
  return (
    <View className="flex-1 bg-slate-900 justify-center items-center p-6">
      <TouchableOpacity 
        className="absolute top-12 left-6 p-3 bg-slate-800 rounded-full flex-row items-center z-10"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-white text-xl font-bold">←</Text>
      </TouchableOpacity>

      <Text className="text-4xl text-indigo-400 font-bold">Feed</Text>
      <Text className="text-slate-400 mt-4 text-center text-lg">
        (Pantalla en construcción)
      </Text>
    </View>
  );
}
