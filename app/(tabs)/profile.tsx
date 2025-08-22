// app/(tabs)/profile.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "@/constants/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // fetch data from firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("Error", "No authenticated user found");
          return;
        }

        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          Alert.alert("Error", "User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Try connecting to internet");
      }
    };

    fetchUserData();
  }, []);

  const toggleExpand = (section: string) => {
    setExpanded(expanded === section ? null : section);
  };

  if (!userData) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-600 text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <Text className="text-2xl font-bold mb-4">Profile</Text>

      {/* User Info */}
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 shadow-md mb-2"
        onPress={() => toggleExpand("info")}
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold">User Info</Text>
          <Ionicons
            name={expanded === "info" ? "chevron-up" : "chevron-down"}
            size={20}
            color="gray"
          />
        </View>
        {expanded === "info" && (
          <View className="mt-2">
            <Text>Name: {userData.name}</Text>
            <Text>Age: {userData.age}</Text>
            <Text>Gender: {userData.gender}</Text>
            <Text>Height: {userData.height} cm</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Activity & Goal */}
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 shadow-md mb-2"
        onPress={() => toggleExpand("goal")}
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold">Activity & Goal</Text>
          <Ionicons
            name={expanded === "goal" ? "chevron-up" : "chevron-down"}
            size={20}
            color="gray"
          />
        </View>
        {expanded === "goal" && (
          <View className="mt-2">
            <Text>Activity: {userData.activity}</Text>
            <Text>Goal: {userData.goal}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Nutrition */}
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 shadow-md mb-2"
        onPress={() => toggleExpand("nutrition")}
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold">Nutrition</Text>
          <Ionicons
            name={expanded === "nutrition" ? "chevron-up" : "chevron-down"}
            size={20}
            color="gray"
          />
        </View>
        {expanded === "nutrition" && (
          <View className="mt-2">
            <Text>Calories: {userData.calories}</Text>
            <Text>Carbs: {userData.carbs} g</Text>
            <Text>Protein: {userData.protein} g</Text>
            <Text>Fats: {userData.fats} g</Text>
            <Text>Fiber: {userData.fiber} g</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Daily Targets */}
      <TouchableOpacity
        className="bg-white rounded-2xl p-4 shadow-md mb-2"
        onPress={() => toggleExpand("targets")}
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold">Daily Targets</Text>
          <Ionicons
            name={expanded === "targets" ? "chevron-up" : "chevron-down"}
            size={20}
            color="gray"
          />
        </View>
        {expanded === "targets" && (
          <View className="mt-2">
            <Text>
              Calculated At:{" "}
              {userData?.dailyTargets?.calculatedAt || "Not available"}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
