// app/(ai-chat)/index.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';

export default function AIChatScreen() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleAsk = async () => {
    if (!question.trim()) return;

    const userMessage = { type: 'user', text: question };
    setMessages([userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: question }],
          max_tokens: 150,
          temperature: 0.5,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer YOUR_OPENAI_API_KEY`,
          },
        }
      );

      const aiMessage = { type: 'ai', text: response.data.choices[0].message.content.trim() };
      setMessages([userMessage, aiMessage]);
    } catch (error) {
      console.error(error);
      setMessages([
        userMessage,
        { type: 'ai', text: 'Error: Unable to get a response. Try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 bg-white p-4">
        {/* Header with Back Button */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            className="p-2 bg-gray-200 rounded"
            onPress={() => router.back()}
          >
            <Text className="text-lg">← Back</Text>
          </TouchableOpacity>
          <Text className="ml-4 text-xl font-bold">AI Chat</Text>
        </View>

        {/* Scrollable Messages */}
        <ScrollView ref={scrollRef} className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
          {messages.map((msg, index) => (
            <View
              key={index}
              className={`my-2 p-3 max-w-[80%] rounded-xl ${
                msg.type === 'user' ? 'bg-teal-700 self-end' : 'bg-gray-200 self-start'
              }`}
            >
              <Text className={`${msg.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                {msg.text}
              </Text>
            </View>
          ))}
          {loading && (
            <ActivityIndicator size="small" color="#14b8a6" className="self-start mt-2" />
          )}
        </ScrollView>

        {/* Input */}
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 border border-gray-300 rounded-full p-3 mr-2"
            placeholder="Type your question..."
            value={question}
            onChangeText={setQuestion}
          />
          <TouchableOpacity
            className="bg-teal-700 p-3 rounded-full"
            onPress={handleAsk}
            disabled={loading}
          >
            <Text className="text-white font-semibold">{loading ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
