import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, Image } from "react-native";
import { Camera } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";

export default function AICameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const router = useRouter();

  // Request camera permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  // Take photo and send to AI API
  const takePhoto = async () => {
    if (!cameraRef.current) return;
    setLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ 
        quality: 0.7, 
        base64: true 
      });
      setPhotoUri(photo.uri);

      // Call AI API
      const response = await axios.post(
        "https://your-ai-api-endpoint.com/analyze",
        { image: photo.base64 }
      );

      setResult(response.data.result);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setResult("Failed to analyze image.");
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Back Button */}
      <TouchableOpacity
        className="absolute top-12 left-4 bg-white p-2 rounded-full z-10"
        onPress={() => router.push("/")}
      >
        <Feather name="arrow-left" size={24} color="black" />
      </TouchableOpacity>

      {/* Camera component with simple string type */}
      <Camera 
        ref={cameraRef} 
        style={{ flex: 1 }} 
        type={cameraType as any}
      >
        <View className="absolute bottom-10 w-full flex-row justify-around items-center px-4">
          <TouchableOpacity
            className="bg-white p-4 rounded-full"
            onPress={takePhoto}
          >
            <Feather name="camera" size={30} color="black" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white p-4 rounded-full"
            onPress={() =>
              setCameraType(cameraType === "back" ? "front" : "back")
            }
          >
            <Feather name="refresh-ccw" size={30} color="black" />
          </TouchableOpacity>
        </View>
      </Camera>

      {/* Overlay Result */}
      <Modal visible={!!result} transparent animationType="slide">
        <View className="flex-1 bg-black/70 justify-center items-center p-6">
          <View className="bg-white rounded-xl p-6 w-full">
            <Text className="text-lg font-bold mb-4">AI Analysis Result</Text>
            {photoUri && (
              <Image 
                source={{ uri: photoUri }} 
                className="w-full h-60 rounded-lg mb-4" 
              />
            )}
            <Text className="text-base">{result}</Text>

            <TouchableOpacity
              className="mt-4 bg-teal-700 p-3 rounded-lg items-center"
              onPress={() => {
                setResult(null);
                setPhotoUri(null);
              }}
            >
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View className="absolute inset-0 justify-center items-center bg-black/50">
          <ActivityIndicator size="large" color="#00f" />
        </View>
      )}
    </SafeAreaView>
  );
}