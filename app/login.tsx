import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-teal-700">
      {/* Already a User text */}
      <View className="mt-16 items-center">
        <Text className="text-white text-lg">Already a User?</Text>
      </View>

      {/* White Card */}
      <View className="flex-1 mt-10 bg-white rounded-t-[40px] p-6">
        {/* Title */}
        <Text className="text-center text-lg font-semibold mb-6">
          Login to continue
        </Text>

        {/* Phone Input */}
        <View className="flex-row space-x-2 mb-4">
          <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 w-[80px] justify-center">
            <Text className="text-gray-700 font-medium">+251</Text>
          </View>
          <TextInput
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          />
        </View>

        {/* Create Account Button */}
        <TouchableOpacity className="bg-teal-700 py-3 rounded-lg mb-4">
          <Text className="text-center text-white font-semibold">
            Create Account
          </Text>
        </TouchableOpacity>

        {/* Continue With */}
        <Text className="text-center text-gray-500 mb-4">
          or continue with
        </Text>

        {/* Social Buttons */}
        <View className="flex-row justify-center space-x-4 mb-6">
          <TouchableOpacity className="p-3 bg-gray-100 rounded-lg">
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
              }}
              className="w-6 h-6"
            />
          </TouchableOpacity>

          <TouchableOpacity className="p-3 bg-gray-100 rounded-lg">
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
              }}
              className="w-6 h-6"
            />
          </TouchableOpacity>

          <TouchableOpacity className="p-3 bg-gray-100 rounded-lg">
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png",
              }}
              className="w-6 h-6"
            />
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text className="text-center text-xs text-gray-400">
          By signing up, I agree to the Terms of service and privacy policy,
          including usage of cookies
        </Text>
      </View>
    </View>
  );
}
