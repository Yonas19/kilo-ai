import { StyleSheet, Text, TextInput, View } from "react-native";
import React from "react";

export default function login() {
  return (
    <View className="flex-1 bg-cyan-700 ">
      <Text className="text-white">Already a user ?</Text>
      <View className="bg-white flex-1 al border-r-8">
        <Text>Login to continue</Text>
        <span>
          <Text>+251</Text>
          <TextInput />
        </span>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
