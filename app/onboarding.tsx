import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';

const OnboardingScreen = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    gender: '',
    age: '',
    height: '',
    weight: '',
    goal: '',
    activity: '',
  });

  const nextStep = () => setStep(prev => prev + 1);

  const handleSelect = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <View className="flex-1 p-6 justify-center">
      {step === 1 && (
        <View>
          <Text className="text-xl font-bold mb-2">Hey there!</Text>
          <Text className="text-gray-500 mb-6">
            We are happy that you have taken the first step towards a healthier you. 
            You’ll need a few details to kickstart your journey.
          </Text>
          <Text className="mb-2 font-medium">What's Your Name</Text>
          <TextInput
            className="border border-gray-300 rounded px-4 py-2 mb-6"
            placeholder="Enter your name"
            value={form.name}
            onChangeText={text => handleSelect('name', text)}
          />
          <TouchableOpacity onPress={nextStep} className="bg-teal-600 py-3 rounded items-center">
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View>
          <Text className="text-lg font-bold mb-4">Tell us about yourself</Text>

          <View className="flex-row mb-4">
            {['Male', 'Female'].map(gender => (
              <Pressable
                key={gender}
                onPress={() => handleSelect('gender', gender)}
                className={`px-4 py-2 border rounded mr-2 ${
                  form.gender === gender ? 'border-teal-600' : 'border-gray-300'
                }`}
              >
                <Text>{gender}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Age"
            keyboardType="numeric"
            className="border border-gray-300 rounded px-4 py-2 mb-4"
            value={form.age}
            onChangeText={text => handleSelect('age', text)}
          />
          <TextInput
            placeholder="Height (cm)"
            keyboardType="numeric"
            className="border border-gray-300 rounded px-4 py-2 mb-4"
            value={form.height}
            onChangeText={text => handleSelect('height', text)}
          />
          <TextInput
            placeholder="Weight (kg)"
            keyboardType="numeric"
            className="border border-gray-300 rounded px-4 py-2 mb-6"
            value={form.weight}
            onChangeText={text => handleSelect('weight', text)}
          />

          <TouchableOpacity onPress={nextStep} className="bg-teal-600 py-3 rounded items-center">
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View>
          <Text className="text-lg font-bold mb-6">What's Your Goal?</Text>
          {['Lose Weight', 'Gain muscle', 'Maintain'].map(goal => (
            <Pressable
              key={goal}
              onPress={() => handleSelect('goal', goal)}
              className={`px-4 py-3 rounded mb-3 border ${
                form.goal === goal ? 'border-teal-600' : 'border-gray-300'
              }`}
            >
              <Text className="text-center">{goal}</Text>
            </Pressable>
          ))}

          <TouchableOpacity onPress={nextStep} className="bg-teal-600 py-3 rounded items-center mt-4">
            <Text className="text-white font-semibold">Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 4 && (
        <View>
          <Text className="text-lg font-bold mb-6">How active are you?</Text>
          {['Mostly sitting', 'Often standing', 'Regular walking', 'Physically intense work'].map(activity => (
            <Pressable
              key={activity}
              onPress={() => handleSelect('activity', activity)}
              className={`px-4 py-3 rounded mb-3 border ${
                form.activity === activity ? 'border-teal-600' : 'border-gray-300'
              }`}
            >
              <Text className="text-center">{activity}</Text>
            </Pressable>
          ))}

          <TouchableOpacity onPress={() => console.log('Form Submitted:', form)} className="bg-teal-600 py-3 rounded items-center mt-4">
            <Text className="text-white font-semibold">Finish</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OnboardingScreen;
