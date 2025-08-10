import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

export default function login() {
  return (
    <View className="flex-1 bg-teal-700">
      {/* Already a User text */}
      <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
          <Text className="text-white text-lg text-right p-4">Already a User?</Text>
        </TouchableOpacity>
      {/* White Card */}
      <View className="mt-10 flex-1 rounded-t-[40px] bg-white p-6">
        {/* Title */}
        <Text className="mb-6 text-center text-lg font-semibold">Login to continue</Text>

        {/* Phone Input */}
        <View className="mb-4 flex-row space-x-2">
          <View className="w-[80px] flex-row items-center justify-center rounded-lg border border-gray-300 px-3 py-2">
            <Text className="font-medium text-gray-700">+251</Text>
          </View>
          <TextInput
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
          />
        </View>

        {/* Create Account Button */}
        <TouchableOpacity className="mb-4 rounded-lg bg-teal-700 py-3">
          <Text className="text-center font-semibold text-white">Create Account</Text>
        </TouchableOpacity>

        {/* Continue With */}
        <Text className="mb-4 text-center text-gray-500">or continue with</Text>

        {/* Social Buttons */}
        <View className="mb-6 flex-row justify-center space-x-4">
          <TouchableOpacity className="rounded-lg bg-gray-100 p-3">
            <Image
              source={{
                uri: 'https://imgs.search.brave.com/JcZoc4RsUy1VvRIMg7kDEyaa3nbA4k0G8gdk_fd6SJ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9wbHVz/cG5nLmNvbS9pbWct/cG5nL2dvb2dsZS1s/b2dvLXBuZy1yZXZp/c2VkLWdvb2dsZS1s/b2dvLTE2MDAucG5n',
              }}
              className="h-6 w-6"
            />
          </TouchableOpacity>

          <TouchableOpacity className="rounded-lg bg-gray-100 p-3">
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
              }}
              className="h-6 w-6"
            />
          </TouchableOpacity>

          <TouchableOpacity className="rounded-lg bg-gray-100 p-3">
            <Image
              source={{
                uri: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png',
              }}
              className="h-6 w-6"
            />
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text className="text-center text-xs text-gray-400">
          By signing up, I agree to the Terms of service and privacy policy, including usage of
          cookies
        </Text>
      </View>
    </View>
  );
}
