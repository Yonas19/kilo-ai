// App.js
import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function otp() {
  return (
    <SafeAreaView className="flex-1 bg-teal-700">
      <StatusBar style="light" />
      
      {/* White Card */}
      <View className="flex-1 bg-white rounded-t-3xl mt-20 p-6 items-center">
        {/* Title */}
        <Text className="text-lg font-medium mt-4">Enter OTP received</Text>

        {/* OTP Inputs */}
        <View className="flex-row mt-6 space-x-3">
          {[...Array(4)].map((_, index) => (
            <TextInput
              key={index}
              maxLength={1}
              keyboardType="numeric"
              className="w-12 h-12 border border-gray-300 rounded-lg text-center text-lg"
            />
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity className="bg-teal-700 px-12 py-3 rounded-lg mt-6">
          <Text className="text-white text-base font-medium">Verify</Text>
        </TouchableOpacity>

        {/* Divider text */}
        <Text className="text-gray-400 mt-6">or continue with</Text>

        {/* Social Icons */}
        <View className="flex-row mt-4 space-x-6">
          <TouchableOpacity className="bg-gray-100 p-3 rounded-lg">
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png" }}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-100 p-3 rounded-lg">
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" }}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity className="bg-gray-100 p-3 rounded-lg">
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" }}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Terms text */}
        <Text className="text-xs text-gray-400 text-center mt-8 px-4">
          By signing up, I agree to the Terms of service and privacy policy, including usage of cookies
        </Text>
      </View>
    </SafeAreaView>
  );
}
