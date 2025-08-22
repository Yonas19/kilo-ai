// app/onboarding.tsx  (or wherever your screen lives)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native';
import { db, auth } from '@/constants/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';

import { getTargetsFromGemini as getTargets } from '@/lib/gemini';

import { OnboardingProfile } from '@/lib/nutrition';

const OnboardingScreen = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<OnboardingProfile>({
    name: '',
    gender: '' as any,
    age: '',
    height: '',
    weight: '',
    goal: '' as any,
    activity: '' as any,
  });

  // Track current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else router.replace('/login'); // redirect if not signed in
    });
    return unsubscribe;
  }, []);

  const nextStep = () => {
    // Step validation
    if (step === 1 && !form.name) return Alert.alert('Error', 'Please enter your name');
    if (step === 2 && (!form.gender || !form.age || !form.height || !form.weight))
      return Alert.alert('Error', 'Please fill all fields');
    if (step === 3 && !form.goal) return Alert.alert('Error', 'Please select a goal');
    if (step === 4 && !form.activity) return Alert.alert('Error', 'Please select activity');

    setStep(prev => prev + 1);
  };

  const handleSelect = (key: keyof OnboardingProfile, value: string) => {
    setForm({ ...form, [key]: value as any });
  };

  const handleFinish = async () => {
    if (!userId) {
      Alert.alert('Error', 'User not signed in');
      return;
    }

    try {
      setLoading(true);
      // 1) Save profile first
      await setDoc(doc(db, 'users', userId), {
        ...form,
        uid: userId,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      // 2) Call OpenAI to compute daily targets (with fallback if needed)
      const targets = await getTargets(form);

      // 3) Persist targets into the same doc
      await updateDoc(doc(db, 'users', userId), {
        dailyTargets: {
          ...targets,
          method: 'openai+mifflin',
          calculatedAt: new Date().toISOString(),
        },
      });

      Alert.alert('Success', 'Your plan is ready!');
      router.replace('/(tabs)'); // go to home
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      {step === 1 && (
        <View>
          <Text className="text-xl font-bold mb-2">Hey there!</Text>
          <Text className="text-gray-500 mb-6">
            We are happy that you have taken the first step towards a healthier you.
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
            {['Male', 'Female'].map(g => (
              <Pressable
                key={g}
                onPress={() => handleSelect('gender', g)}
                className={`px-4 py-2 border rounded mr-2 ${form.gender === g ? 'border-teal-600' : 'border-gray-300'}`}
              >
                <Text>{g}</Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            placeholder="Age"
            keyboardType="numeric"
            className="border border-gray-300 rounded px-4 py-2 mb-4"
            value={String(form.age)}
            onChangeText={text => handleSelect('age', text)}
          />
          <TextInput
            placeholder="Height (cm)"
            keyboardType="numeric"
            className="border border-gray-300 rounded px-4 py-2 mb-4"
            value={String(form.height)}
            onChangeText={text => handleSelect('height', text)}
          />
          <TextInput
            placeholder="Weight (kg)"
            keyboardType="numeric"
            className="border border-gray-300 rounded px-4 py-2 mb-6"
            value={String(form.weight)}
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
              className={`px-4 py-3 rounded mb-3 border ${form.goal === goal ? 'border-teal-600' : 'border-gray-300'}`}
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
              className={`px-4 py-3 rounded mb-3 border ${form.activity === activity ? 'border-teal-600' : 'border-gray-300'}`}
            >
              <Text className="text-center">{activity}</Text>
            </Pressable>
          ))}

          <TouchableOpacity onPress={handleFinish} className="bg-teal-600 py-3 rounded items-center mt-4" disabled={loading}>
            <Text className="text-white font-semibold">{loading ? 'Preparing your plan...' : 'Finish'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OnboardingScreen;
