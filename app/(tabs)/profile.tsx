import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { db, auth } from "@/constants/firebase";
import { doc, getDoc } from "firebase/firestore";

const ProfileScreen = () => {
  const [userName, setUserName] = useState<string>("Loading...");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Mock data for now
  const caloriesEaten = 1450;
  const dailyTarget = 2000;
  const estimatedWeeklyChange = ((caloriesEaten - dailyTarget) * 7) / 7700; // 7700 kcal ~ 1kg

  const reminders = [
    { time: "8:00 AM", task: "Breakfast" },
    { time: "1:00 PM", task: "Lunch" },
    { time: "7:00 PM", task: "Dinner" },
  ];

  const metrics = {
    weight: 70,
    goalWeight: 65,
    height: 175,
  };
  const bmi = (metrics.weight / (metrics.height / 100) ** 2).toFixed(1);

  // Fetch name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name || "User");
        } else {
          setUserName("User");
        }
      } catch (error) {
        console.error("Error fetching user name:", error);
        setUserName("User");
      }
    };
    fetchUserName();
  }, []);

  const toggleAccordion = (key: string) => {
    setExpanded(expanded === key ? null : key);
  };

  return (
    <ScrollView className="flex-1 bg-white p-6 pt-14">
      {/* Header */}
      <Text className="text-xl font-bold mb-6">Profile</Text>

      {/* Profile Info */}
      <View className="flex-row items-center mb-6">
        <View className="bg-teal-600 p-3 rounded-full">
          <Ionicons name="person" size={54} color="white" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-lg font-semibold">{userName}</Text>
          <Text className="text-gray-500">{auth.currentUser?.phoneNumber || ""}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="pencil" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Accordion Items */}
      {/* Progress Report */}
      <TouchableOpacity
        className="flex-row justify-between items-center bg-gray-100 p-4 rounded-lg mb-3"
        onPress={() => toggleAccordion("progress")}
      >
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={20} color="black" />
          <Text className="ml-3 font-medium">Progress Report</Text>
        </View>
        <Ionicons
          name={expanded === "progress" ? "chevron-up" : "chevron-down"}
          size={20}
          color="gray"
        />
      </TouchableOpacity>
      {expanded === "progress" && (
        <View className="bg-gray-50 p-4 mb-3 rounded-lg">
          <Text>Calories eaten today: {caloriesEaten} kcal</Text>
          <Text>Daily target: {dailyTarget} kcal</Text>
          <Text>
            Estimated change this week: {estimatedWeeklyChange.toFixed(2)} kg
          </Text>
        </View>
      )}

      {/* Reminders */}
      <TouchableOpacity
        className="flex-row justify-between items-center bg-gray-100 p-4 rounded-lg mb-3"
        onPress={() => toggleAccordion("reminder")}
      >
        <View className="flex-row items-center">
          <Ionicons name="alarm-outline" size={20} color="black" />
          <Text className="ml-3 font-medium">Reminders</Text>
        </View>
        <Ionicons
          name={expanded === "reminder" ? "chevron-up" : "chevron-down"}
          size={20}
          color="gray"
        />
      </TouchableOpacity>
      {expanded === "reminder" && (
        <View className="bg-gray-50 p-4 mb-3 rounded-lg">
          {reminders.map((r, idx) => (
            <Text key={idx}>
              {r.time} - {r.task}
            </Text>
          ))}
        </View>
      )}

      {/* Weight & Body Metrics */}
      <TouchableOpacity
        className="flex-row justify-between items-center bg-gray-100 p-4 rounded-lg mb-3"
        onPress={() => toggleAccordion("metrics")}
      >
        <View className="flex-row items-center">
          <Ionicons name="trending-up-outline" size={20} color="black" />
          <Text className="ml-3 font-medium">Weight & Body Metrics</Text>
        </View>
        <Ionicons
          name={expanded === "metrics" ? "chevron-up" : "chevron-down"}
          size={20}
          color="gray"
        />
      </TouchableOpacity>
      {expanded === "metrics" && (
        <View className="bg-gray-50 p-4 mb-3 rounded-lg">
          <Text>Current Weight: {metrics.weight} kg</Text>
          <Text>Goal Weight: {metrics.goalWeight} kg</Text>
          <Text>Height: {metrics.height} cm</Text>
          <Text>BMI: {bmi}</Text>
        </View>
      )}

      {/* Health & Help */}
      <View className="bg-gray-100 p-4 rounded-lg mb-3">
        <TouchableOpacity className="flex-row items-center mb-4">
          <Ionicons name="medkit-outline" size={20} color="black" />
          <Text className="ml-3 text-gray-600">Health and Medical info</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <Ionicons name="help-circle-outline" size={20} color="black" />
          <Text className="ml-3 text-gray-600">Help & Support</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity className="bg-teal-600 py-3 rounded-lg mt-4 items-center">
        <Text className="text-white font-semibold">Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;
