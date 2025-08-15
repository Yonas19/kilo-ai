import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth } from '@/constants/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Email/password login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)'); // Navigate to main app
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider); // web only
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-teal-700 justify-center px-6">
      <Text className="text-white text-3xl font-bold mb-8 text-center">Welcome Back!</Text>

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
        className="bg-white rounded-xl px-4 py-3 mb-6 text-gray-800"
      />

      <TouchableOpacity
        onPress={handleEmailLogin}
        className="bg-white rounded-xl py-3 mb-4"
        disabled={loading}
      >
        <Text className="text-teal-700 font-semibold text-center text-lg">
          {loading ? 'Signing in...' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      <Text className="text-white text-center my-2">or</Text>

      <TouchableOpacity
        onPress={handleGoogleLogin}
        className="bg-white rounded-xl py-3 mt-2 flex-row justify-center items-center"
        disabled={loading}
      >
        <Text className="text-teal-700 font-semibold text-lg">Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/signup')}
        className="mt-6"
      >
        <Text className="text-white text-center underline">
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
}
