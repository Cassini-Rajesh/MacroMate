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
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{meal.food_name}</h3>
          <p className="text-gray-400 text-sm">{time}</p>
        </div>
        <span className="bg-orange-50 text-orange-600 font-bold px-3 py-1 rounded-lg text-sm">
          {meal.calories} kcal
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <MacroChip label="Protein" value={meal.protein} color="text-blue-600 bg-blue-50" />
        <MacroChip label="Carbs" value={meal.carbs} color="text-yellow-600 bg-yellow-50" />
        <MacroChip label="Fat" value={meal.fat} color="text-pink-600 bg-pink-50" />
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
