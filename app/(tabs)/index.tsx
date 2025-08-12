import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  const caloriePercent = (780 / 2600) * 100;

  const nutrientData = [
    { name: 'Proteins', value: 26, goal: 120, color: 'green' },
    { name: 'Carbs', value: 50, goal: 200, color: 'yellow' },
    { name: 'Fats', value: 100, goal: 100, color: 'red' },
    { name: 'Fiber', value: 26, goal: 120, color: 'blue' },
  ];

  return (
    <View className="flex-1 bg-white p-6 pt-14">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-xl font-bold">
          Hello <Text className="underline">Yonas</Text>!
        </Text>
        <TouchableOpacity className="bg-teal-600 px-4 py-1 rounded-full">
          <Text className="text-white font-semibold">Today</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-gray-500 mb-4 text-lg">Your tracker</Text>

      {/* Circular Progress */}
      <View className="items-center mb-8">
        <AnimatedCircularProgress
          size={160}
          width={12}
          fill={caloriePercent}
          tintColor="#fb7185"
          backgroundColor="#fcd6db"
          rotation={0}
        >
          {() => (
            <View className="items-center">
              <Text className="font-semibold text-lg">Calories</Text>
              <Text className="text-gray-500">780 of 2600kcal</Text>
            </View>
          )}
        </AnimatedCircularProgress>
      </View>

      {/* Nutrients */}
      {nutrientData.map((item) => {
        const percent = (item.value / item.goal) * 100;

        return (
          <View key={item.name} className="mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="font-medium">{item.name}</Text>
              <Text className="text-gray-500">{item.value}g /{item.goal}g</Text>
            </View>
            <View className="w-full h-2 rounded-full bg-gray-200">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${percent > 100 ? 100 : percent}%`,
                  backgroundColor: item.color,
                }}
              />
            </View>
          </View>
        );
      })}

      {/* Floating Camera Button */}
      <View className="absolute bottom-20 left-0 right-0 items-center">
        <TouchableOpacity className="bg-teal-600 p-4 rounded-full shadow-lg">
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
