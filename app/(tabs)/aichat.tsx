import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen({ navigation }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Simulated AI response
  const simulateAIResponse = (userMessage) => {
    setIsGenerating(true);

    // Add "Generating..." message placeholder
    const loadingMessage = {
      id: Date.now() + 1,
      text: 'Generating...',
      sender: 'ai',
      loading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    setTimeout(() => {
      // Remove loading
      setMessages((prev) =>
        prev.map((msg) =>
          msg.loading ? { ...msg, text: getSimulatedReply(userMessage), loading: false } : msg
        )
      );
      setIsGenerating(false);
    }, 2000);
  };

  const handleSend = () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    simulateAIResponse(input);
    setInput('');
  };

  const getSimulatedReply = (message) => {
    // Basic fake reply logic (replace with OpenAI later)
    return `You said: "${message}". That's interesting! 🤖`;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center px-4 pt-12 pb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="ml-4 text-xl font-semibold">Ria</Text>
      </View>

      {/* Chat Messages */}
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`my-2 max-w-[80%] rounded-xl px-4 py-2 ${
              msg.sender === 'user'
                ? 'bg-teal-100 self-end'
                : 'bg-gray-200 self-start'
            }`}
          >
            <Text className="text-gray-800">
              {msg.loading ? <LoadingDots /> : msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input */}
      <View className="absolute bottom-4 left-4 right-4 flex-row items-center px-4 py-2 bg-teal-50 rounded-full shadow">
        <TextInput
          className="flex-1 text-gray-800"
          placeholder="Talk to AI"
          placeholderTextColor="#94a3b8"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={handleSend} disabled={isGenerating}>
          <Ionicons
            name="send"
            size={20}
            color={isGenerating ? '#94a3b8' : '#0f766e'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Loading animation component
const LoadingDots = () => {
  const [dots, setDots] = useState('');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <Text className="text-gray-500">Generating{dots}</Text>;
};
