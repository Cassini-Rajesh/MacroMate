export interface MacroTargets {
  calories: number
  protein: number
  carbs: number
  fat: number
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  active: 1.55,
  very_active: 1.725,
}

export function calculateMacros(
  weightLbs: number,
  heightInches: number,
  age: number,
  goal: 'cut' | 'bulk' | 'maintain',
  activityLevel: string
): MacroTargets {
  // Convert to metric
  const weightKg = weightLbs * 0.453592
  const heightCm = heightInches * 2.54

  // Mifflin-St Jeor BMR (assuming male formula; can be refined)
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5

  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel as keyof typeof ACTIVITY_MULTIPLIERS] ?? 1.375
  const tdee = Math.round(bmr * multiplier)

  let calories: number
  if (goal === 'cut') calories = Math.round(tdee - 500)
  else if (goal === 'bulk') calories = Math.round(tdee + 300)
  else calories = tdee

  // Macro split: protein 30%, carbs 40%, fat 30%
  const protein = Math.round((calories * 0.30) / 4)
  const carbs = Math.round((calories * 0.40) / 4)
  const fat = Math.round((calories * 0.30) / 9)

  return { calories, protein, carbs, fat }
}
