// lib/nutrition.ts
export type OnboardingProfile = {
    name: string;
    gender: 'Male' | 'Female';
    age: string | number;
    height: string | number; // cm
    weight: string | number; // kg
    goal: 'Lose Weight' | 'Gain muscle' | 'Maintain';
    activity: 'Mostly sitting' | 'Often standing' | 'Regular walking' | 'Physically intense work';
  };
  
  export type DailyTargets = {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
  
  export const activityMultipliers: Record<OnboardingProfile['activity'], number> = {
    'Mostly sitting': 1.2,
    'Often standing': 1.375,
    'Regular walking': 1.55,
    'Physically intense work': 1.725,
  };
  
  export function normalizeProfile(p: OnboardingProfile) {
    return {
      ...p,
      age: Number(p.age),
      height: Number(p.height),
      weight: Number(p.weight),
      gender: p.gender.toLowerCase().startsWith('m') ? 'male' : 'female' as 'male' | 'female',
    };
  }
  
  // Local fallback if OpenAI is unavailable
  export function fallbackCalculateTargets(p: OnboardingProfile): DailyTargets {
    const np = normalizeProfile(p);
    const bmr =
      np.gender === 'male'
        ? 10 * np.weight + 6.25 * np.height - 5 * np.age + 5
        : 10 * np.weight + 6.25 * np.height - 5 * np.age - 161;
  
    const mult = activityMultipliers[p.activity] ?? 1.2;
    let tdee = bmr * mult;
  
    // goal adjustment: -15% / 0% / +10%
    if (p.goal === 'Lose Weight') tdee = tdee * 0.85;
    if (p.goal === 'Gain muscle') tdee = tdee * 1.10;
  
    // macros: protein 1.8 g/kg, fat >= 0.8 g/kg (use 1.0 g/kg), carbs rest, fiber 14 g / 1000 kcal
    const protein_g = np.weight * 1.8;
    const fat_g = np.weight * 1.0;
    const protein_kcal = protein_g * 4;
    const fat_kcal = fat_g * 9;
  
    const remaining_kcal = Math.max(tdee - (protein_kcal + fat_kcal), 0);
    const carbs_g = remaining_kcal / 4;
    const fiber_g = (tdee / 1000) * 14;
  
    return {
      calories: Math.round(tdee),
      protein_g: Math.round(protein_g),
      carbs_g: Math.round(carbs_g),
      fat_g: Math.round(fat_g),
      fiber_g: Math.round(fiber_g),
    };
  }
  