// lib/gemini.ts
import { DailyTargets, OnboardingProfile, fallbackCalculateTargets, normalizeProfile, activityMultipliers } from './nutrition';

const GEMINI_API_KEY = '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';

export async function getTargetsFromGemini(profile: OnboardingProfile): Promise<DailyTargets> {
  const p = normalizeProfile(profile);
  const multiplier = activityMultipliers[profile.activity] ?? 1.2;

  const prompt = `
You are a precise nutrition assistant. Given this user profile, return ONLY valid JSON with numbers (no prose):

{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number
}

Profile:
- Gender: ${p.gender}
- Age: ${p.age}
- Height: ${p.height} cm
- Weight: ${p.weight} kg
- Activity multiplier: ${multiplier}
- Goal: ${profile.goal}
`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash',
        messages: [
          { role: 'system', content: 'You are a precise nutrition assistant. Return JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('No content from Gemini');

    // Extract first JSON object from text (robust for extra commentary)
    const match = text.match(/\{[\s\S]*\}/);
    const parsed: DailyTargets = match ? JSON.parse(match[0]) : fallbackCalculateTargets(profile);

    // Basic validation
    if (Object.values(parsed).some(v => Number.isNaN(v))) {
      return fallbackCalculateTargets(profile);
    }

    return parsed;
  } catch (err) {
    console.warn('Gemini AI failed, using fallback:', err);
    return fallbackCalculateTargets(profile);
  }
}
