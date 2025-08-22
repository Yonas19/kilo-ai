// lib/geminiChat.ts
const GEMINI_API_KEY = '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';

export type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
};

export async function sendToGemini(messages: ChatMessage[]): Promise<string> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-exp:free',
        messages: messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || 'No response';
  } catch (err) {
    console.warn('Gemini chat failed:', err);
    return 'Error: AI did not respond';
  }
}
