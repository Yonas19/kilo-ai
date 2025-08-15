import { Text, View } from 'react-native';
import React from 'react';

export default function language() {
  return (
    <View className="flex-1 items-center justify-center ">
      <Text className="text-2xl">Choose your language</Text>
      <View className="mt-8 flex-row gap-5 ">
        <Text className="rounded-md  border border-gray-300 p-10 text-lg">English</Text>
        <Text className="rounded-md  border border-gray-300 p-10 text-lg ">Amharic</Text>
      </View>
    </View>
  );
}

