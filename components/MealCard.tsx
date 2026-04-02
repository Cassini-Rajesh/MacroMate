interface Meal {
  id: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  logged_at: string
}

export default function MealCard({ meal }: { meal: Meal }) {
  const time = new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return (
    <div className="bg-surface rounded-2xl p-5 border border-borderSlate shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white">{meal.food_name}</h3>
          <p className="text-textSecondary text-sm">{time}</p>
        </div>
        <span className="bg-surface2 text-accent font-bold px-3 py-1 rounded-lg text-sm">
          {meal.calories} kcal
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MacroChip label="Protein" value={meal.protein} color="text-success bg-surface2" />
        <MacroChip label="Carbs" value={meal.carbs} color="text-macroBlue bg-surface2" />
        <MacroChip label="Fat" value={meal.fat} color="text-macroPurple bg-surface2" />
      </div>
    </div>
  )
}

function MacroChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`${color} rounded-xl px-3 py-2 text-center`}>
      <div className="font-bold text-sm">{value}g</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  )
}
