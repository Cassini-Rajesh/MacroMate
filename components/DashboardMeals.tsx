'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import MacroBar from './MacroBar'

interface Meal {
  id: string
  food_name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  saturated_fat?: number
  fiber?: number
  sugar?: number
  sodium?: number
  logged_at: string
}

interface Profile {
  name?: string
  daily_calories: number
  daily_protein: number
  daily_carbs: number
  daily_fat: number
}

interface Props {
  initialMeals: Meal[]
  profile: Profile
}

export default function DashboardMeals({ initialMeals, profile }: Props) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ food_name: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, saturated_fat: 0 })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const supabase = createClient()

  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
        fiber: acc.fiber + (meal.fiber ?? 0),
        sugar: acc.sugar + (meal.sugar ?? 0),
        sodium: acc.sodium + (meal.sodium ?? 0),
        saturatedFat: acc.saturatedFat + (meal.saturated_fat ?? 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, saturatedFat: 0 }
    )
  }, [meals])

  const startEdit = (meal: Meal) => {
    setEditingMealId(meal.id)
    setEditValues({
      food_name: meal.food_name,
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fat: meal.fat,
      fiber: meal.fiber ?? 0,
      sugar: meal.sugar ?? 0,
      sodium: meal.sodium ?? 0,
      saturated_fat: meal.saturated_fat ?? 0,
    })
    setError('')
    setConfirmDeleteId(null)
  }

  const cancelEdit = () => {
    setEditingMealId(null)
    setError('')
  }

  const handleUpdate = async (mealId: string) => {
    setLoadingId(mealId)
    setError('')

    const { error: updateError, data: updatedMeals } = await supabase
      .from('meals')
      .update({
        food_name: editValues.food_name,
        calories: editValues.calories,
        protein: editValues.protein,
        carbs: editValues.carbs,
        fat: editValues.fat,
        fiber: editValues.fiber,
        sugar: editValues.sugar,
        sodium: editValues.sodium,
        saturated_fat: editValues.saturated_fat,
      })
      .eq('id', mealId)
      .select()
      .single()

    setLoadingId(null)

    if (updateError || !updatedMeals) {
      setError(updateError?.message || 'Failed to update meal')
      return
    }

    setMeals(meals.map(meal => (meal.id === mealId ? { ...meal, ...updatedMeals } : meal)))
    setEditingMealId(null)
  }

  const handleDelete = async (mealId: string) => {
    setLoadingId(mealId)
    setError('')

    const { error: deleteError } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId)

    setLoadingId(null)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setMeals(meals.filter(meal => meal.id !== mealId))
    setConfirmDeleteId(null)
    if (editingMealId === mealId) {
      setEditingMealId(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-textPrimary">
      {error && (
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-2xl border border-danger/30">{error}</div>
      )}

      <div className="bg-surface rounded-3xl p-6 border border-borderSlate">
        <h2 className="text-lg font-bold text-textPrimary mb-5">Today&apos;s Progress</h2>
        <div className="space-y-4">
          <MacroBar label="Calories" consumed={totals.calories} target={profile.daily_calories} color="bg-accent" unit="kcal" />
          <MacroBar label="Protein" consumed={totals.protein} target={profile.daily_protein} color="bg-success" unit="g" />
          <MacroBar label="Carbs" consumed={totals.carbs} target={profile.daily_carbs} color="bg-macroBlue" unit="g" />
          <MacroBar label="Fat" consumed={totals.fat} target={profile.daily_fat} color="bg-macroPurple" unit="g" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-3xl border border-borderSlate bg-surface p-4 text-sm text-textPrimary">
            <div className="font-semibold">🌾 Fiber</div>
            <div className="mt-2 text-lg font-bold">{totals.fiber}g</div>
            <div className="text-xs text-textSecondary">Goal 25g</div>
          </div>
          <div className="rounded-3xl border border-borderSlate bg-surface p-4 text-sm text-textPrimary">
            <div className="font-semibold">🍬 Sugar</div>
            <div className="mt-2 text-lg font-bold">{totals.sugar}g</div>
            <div className="text-xs text-textSecondary">Track only</div>
          </div>
          <div className="rounded-3xl border border-borderSlate bg-surface p-4 text-sm text-textPrimary">
            <div className="font-semibold">🧂 Sodium</div>
            <div className="mt-2 text-lg font-bold">{totals.sodium}mg</div>
            <div className="text-xs text-textSecondary">Limit 2300mg</div>
          </div>
          <div className="rounded-3xl border border-borderSlate bg-surface p-4 text-sm text-textPrimary">
            <div className="font-semibold">🥩 Saturated Fat</div>
            <div className="mt-2 text-lg font-bold">{totals.saturatedFat}g</div>
            <div className="text-xs text-textSecondary">Limit 20g</div>
          </div>
        </div>
      </div>

      <Link href="/log" className="flex items-center justify-center gap-3 bg-accent hover:bg-accentSoft text-white font-bold text-lg py-4 rounded-2xl transition-all hover:scale-[1.01] shadow-lg shadow-accent/20">
        <PlusIcon />
        Log a Meal
      </Link>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Today&apos;s Meals</h2>
          <span className="text-sm text-gray-500">{meals.length} logged</span>
        </div>
        {meals.length > 0 ? (
          <div className="space-y-4">
            {meals.map(meal => (
              <div key={meal.id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{meal.food_name}</h3>
                    <p className="text-gray-400 text-sm">{new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingMealId !== meal.id && (
                      <button
                        type="button"
                        onClick={() => startEdit(meal)}
                        className="p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
                        aria-label="Edit meal"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setConfirmDeleteId(meal.id); setEditingMealId(null); setError('') }}
                      className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      aria-label="Delete meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {confirmDeleteId === meal.id ? (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center space-y-3">
                    <p className="text-red-700 font-semibold">Remove this meal?</p>
                    <div className="flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(meal.id)}
                        disabled={loadingId === meal.id}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : editingMealId === meal.id ? (
                  <div className="space-y-4">
                    <Field label="Meal Name" value={editValues.food_name} onChange={value => setEditValues(prev => ({ ...prev, food_name: value }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Calories" value={String(editValues.calories)} onChange={value => setEditValues(prev => ({ ...prev, calories: Number(value) }))} type="number" />
                      <Field label="Protein" value={String(editValues.protein)} onChange={value => setEditValues(prev => ({ ...prev, protein: Number(value) }))} type="number" />
                      <Field label="Carbs" value={String(editValues.carbs)} onChange={value => setEditValues(prev => ({ ...prev, carbs: Number(value) }))} type="number" />
                      <Field label="Fat" value={String(editValues.fat)} onChange={value => setEditValues(prev => ({ ...prev, fat: Number(value) }))} type="number" />
                      <Field label="Fiber" value={String(editValues.fiber)} onChange={value => setEditValues(prev => ({ ...prev, fiber: Number(value) }))} type="number" />
                      <Field label="Sugar" value={String(editValues.sugar)} onChange={value => setEditValues(prev => ({ ...prev, sugar: Number(value) }))} type="number" />
                      <Field label="Sodium" value={String(editValues.sodium)} onChange={value => setEditValues(prev => ({ ...prev, sodium: Number(value) }))} type="number" />
                      <Field label="Sat Fat" value={String(editValues.saturated_fat)} onChange={value => setEditValues(prev => ({ ...prev, saturated_fat: Number(value) }))} type="number" />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdate(meal.id)}
                        disabled={loadingId === meal.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold transition-colors disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4 gap-3">
                      <span className="bg-orange-50 text-orange-600 font-bold px-3 py-1 rounded-lg text-sm">{meal.calories} kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <MacroChip label="Protein" value={meal.protein} />
                      <MacroChip label="Carbs" value={meal.carbs} />
                      <MacroChip label="Fat" value={meal.fat} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <p className="text-gray-400 font-medium">No meals logged yet today.</p>
            <p className="text-gray-400 text-sm mt-1">Hit &quot;Log a Meal&quot; to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block text-sm text-gray-600 font-medium">
      <span className="mb-2 inline-block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
      />
    </label>
  )
}

function MacroChip({ label, value }: { label: string; value: number }) {
  const colors = {
    Protein: 'text-blue-600 bg-blue-50',
    Carbs: 'text-yellow-600 bg-yellow-50',
    Fat: 'text-pink-600 bg-pink-50',
  }

  return (
    <div className={`${colors[label as keyof typeof colors]} rounded-xl px-3 py-2 text-center`}>
      <div className="font-bold text-sm">{value}g</div>
      <div className="text-xs opacity-70">{label}</div>
    </div>
  )
}
