import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth } from '@/constants/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created!');
      router.replace('/onboarding'); // navigate to main app
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-teal-700 justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-8 text-center">Create Account</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        className="bg-white rounded-xl px-4 py-3 mb-4 text-gray-800"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        className="bg-white rounded-xl px-4 py-3 mb-4 text-gray-800"
      />

      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        secureTextEntry
        className="bg-white rounded-xl px-4 py-3 mb-6 text-gray-800"
      />

      <TouchableOpacity
        onPress={handleSignup}
        className="bg-white rounded-xl py-3 mb-4"
        disabled={loading}
      >
        <Text className="text-teal-700 font-semibold text-center text-lg">
          {loading ? 'Signing up...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')} className="mt-4">
        <Text className="text-white text-center underline">
          Already have an account? Sign in
        </Text>
      </TouchableOpacity>
    </View>
  );
}
