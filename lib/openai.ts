// lib/openai.ts
import { DailyTargets, OnboardingProfile, fallbackCalculateTargets, normalizeProfile, activityMultipliers } from './nutrition';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY; 
// For quick local testing ONLY, you could hardcode temporarily (not recommended):
// const OPENAI_API_KEY = "sk-proj-..."; 

type OpenAIResponse = {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
};

export async function getTargetsFromOpenAI(profile: OnboardingProfile): Promise<DailyTargets> {
  if (!OPENAI_API_KEY) {
    // No key? Use fallback math.
    return fallbackCalculateTargets(profile);
  }

  const p = normalizeProfile(profile);
  const multiplier = activityMultipliers[profile.activity] ?? 1.2;

  const system = `You are a precise nutrition assistant. Return ONLY valid JSON with numbers. No prose.`;
  const user = {
    role: 'user',
    content: [
      {
        type: 'text',
        text:
`Given:
- gender: ${p.gender}
- age_years: ${p.age}
- height_cm: ${p.height}
- weight_kg: ${p.weight}
- activity_multiplier: ${multiplier}
- goal: ${profile.goal}

Rules:
- Use Mifflin-St Jeor BMR.
- TDEE = BMR * activity_multiplier.
- Goal adj: Lose Weight: -15%, Maintain: 0%, Gain muscle: +10%.
- Protein: 1.8 g/kg.
- Fat: >= 0.8 g/kg (use 1.0 g/kg baseline).
- Carbs = remaining kcal after protein & fat.
- Fiber: 14 g per 1000 kcal.

Return JSON like:
{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number
}`
      }
    ]
  } as const;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          user,
        ],
      }),
    });

    if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}`);
    const data = await res.json();

    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('No content');

    const parsed: OpenAIResponse = JSON.parse(text);
    // Basic validation
    const safe: DailyTargets = {
      calories: Math.round(Number(parsed.calories)),
      protein_g: Math.round(Number(parsed.protein_g)),
      carbs_g: Math.round(Number(parsed.carbs_g)),
      fat_g: Math.round(Number(parsed.fat_g)),
      fiber_g: Math.round(Number(parsed.fiber_g)),
    };

    // If anything NaN, fallback
    if (Object.values(safe).some(v => Number.isNaN(v))) {
      return fallbackCalculateTargets(profile);
    }
    return safe;
  } catch (e) {
    // Any failure → fallback math
    return fallbackCalculateTargets(profile);
  }
}
