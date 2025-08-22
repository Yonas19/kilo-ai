import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { sendToGemini, ChatMessage } from '../../lib/geminiChat';

export default function AIChatScreen() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll down when new messages come in
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!question.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    const aiReply = await sendToGemini([...messages, userMsg]);
    setMessages((prev) => [...prev, { role: 'ai', content: aiReply }]);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16 }}
        className="flex-1"
      >
        {messages.map((msg, idx) => (
          <View
            key={idx}
            className={`mb-3 p-3 rounded-2xl max-w-[80%] ${
              msg.role === 'user'
                ? 'self-end bg-teal-600'
                : 'self-start bg-gray-200'
            }`}
          >
            <Text className={msg.role === 'user' ? 'text-white' : 'text-black'}>
              {msg.content}
            </Text>
          </View>
        ))}

        {loading && (
          <View className="self-start bg-gray-200 p-3 rounded-2xl">
            <ActivityIndicator size="small" color="#333" />
          </View>
        )}
      </ScrollView>

      <View className="flex-row items-center border-t border-gray-200 p-2">
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask me anything..."
          className="flex-1 bg-gray-100 p-3 rounded-xl"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={loading}
          className="ml-2 bg-teal-600 px-4 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
