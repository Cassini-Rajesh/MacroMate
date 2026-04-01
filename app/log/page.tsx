'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera, Mic, PenLine, ArrowLeft, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface MealData {
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  portionEstimate: string
}

export default function LogPage() {
  const [tab, setTab] = useState<'photo' | 'voice' | 'manual'>('photo')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [compressedImageFile, setCompressedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [voiceText, setVoiceText] = useState('')
  const [manualText, setManualText] = useState('')
  const [mealData, setMealData] = useState<MealData | null>(null)
  const [fullMealData, setFullMealData] = useState<MealData | null>(null)
  const [selectedPortion, setSelectedPortion] = useState<'1/4' | '1/2' | '3/4' | 'Full'>('Full')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  async function compressImage(file: File) {
    const imageBitmap = await createImageBitmap(file)
    const maxDim = 1200
    let width = imageBitmap.width
    let height = imageBitmap.height

    if (width > height) {
      if (width > maxDim) {
        height = Math.round((height * maxDim) / width)
        width = maxDim
      }
    } else {
      if (height > maxDim) {
        width = Math.round((width * maxDim) / height)
        height = maxDim
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas not supported')
    ctx.drawImage(imageBitmap, 0, 0, width, height)

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (!blob) throw new Error('Image compression failed')

    return new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setMealData(null)
    setCompressedImageFile(null)

    try {
      const compressed = await compressImage(file)
      setCompressedImageFile(compressed)
    } catch (err) {
      console.error('Image compression failed', err)
      setError('Could not compress image. Please try a smaller photo.')
    }
  }

  const PORTION_MULTIPLIERS: Record<'1/4' | '1/2' | '3/4' | 'Full', number> = {
    '1/4': 0.25,
    '1/2': 0.5,
    '3/4': 0.75,
    Full: 1,
  }

  function buildPortionEstimate(original: string, portion: '1/4' | '1/2' | '3/4' | 'Full') {
    if (portion === 'Full') return original
    const desc = original.replace(/^Full\s+/i, '').replace(/^full\s+/i, '')
    const match = desc.match(/approximately\s+([0-9]+(?:\.[0-9]+)?)\s*g/i)
    if (match) {
      const scaled = Math.round(parseFloat(match[1]) * PORTION_MULTIPLIERS[portion])
      return `${portion} of ${desc.replace(match[0], `approximately ${scaled}g`)}`
    }
    return `${portion} of ${desc}`
  }

  function scaleMealData(fullData: MealData, portion: '1/4' | '1/2' | '3/4' | 'Full') {
    const multiplier = PORTION_MULTIPLIERS[portion]
    return {
      ...fullData,
      calories: Math.round(fullData.calories * multiplier),
      protein: Math.round(fullData.protein * multiplier),
      carbs: Math.round(fullData.carbs * multiplier),
      fat: Math.round(fullData.fat * multiplier),
      portionEstimate: buildPortionEstimate(fullData.portionEstimate, portion),
    }
  }

  async function analyzePhoto() {
    if (!imageFile) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', compressedImageFile ?? imageFile)

      const res = await fetch('/api/analyze-meal', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || `Analyze failed: ${res.status}`)
      } else {
        setFullMealData(data)
        setSelectedPortion('Full')
        setMealData(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze meal')
    } finally {
      setLoading(false)
    }
  }

  async function analyzeText(text: string) {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || `Analyze failed: ${res.status}`)
      } else {
        setFullMealData(data)
        setSelectedPortion('Full')
        setMealData(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze meal')
    } finally {
      setLoading(false)
    }
  }

  async function saveMeal() {
    if (!mealData) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('meals').insert({
      user_id: user.id,
      food_name: mealData.foodName,
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat,
    })

    if (error) { setError(error.message); setSaving(false); return }
    router.push('/dashboard')
  }

  function updateMealField(field: keyof MealData, value: string | number) {
    if (!mealData) return
    setMealData({ ...mealData, [field]: typeof mealData[field] === 'number' ? Number(value) : value })
  }

  function selectPortion(portion: '1/4' | '1/2' | '3/4' | 'Full') {
    if (!fullMealData) return
    setSelectedPortion(portion)
    setMealData(scaleMealData(fullMealData, portion))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-black text-gray-900">Log a Meal</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl">
          {[
            { id: 'photo', label: 'Photo', icon: Camera },
            { id: 'voice', label: 'Describe', icon: Mic },
            { id: 'manual', label: 'Manual', icon: PenLine },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id as typeof tab); setMealData(null); setError('') }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === t.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Photo Tab */}
        {tab === 'photo' && (
          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Meal preview" className="max-h-64 mx-auto rounded-2xl object-cover" />
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Tap to upload a photo</p>
                  <p className="text-gray-400 text-sm mt-1">JPG, PNG, HEIC supported</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <p className="text-gray-400 text-sm">Works best with photos under 10MB</p>
            {imageFile && !mealData && (
              <button onClick={analyzePhoto} disabled={loading} className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Analyze with AI'}
              </button>
            )}
          </div>
        )}

        {/* Voice/Text Tab */}
        {tab === 'voice' && (
          <div className="space-y-4">
            <textarea
              value={voiceText}
              onChange={e => setVoiceText(e.target.value)}
              rows={4}
              className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="Describe what you ate... e.g. 'Two scrambled eggs with whole wheat toast and a large glass of orange juice'"
            />
            <button onClick={() => analyzeText(voiceText)} disabled={!voiceText || loading} className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Analyze with AI'}
            </button>
          </div>
        )}

        {/* Manual Tab */}
        {tab === 'manual' && (
          <div className="space-y-4">
            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              rows={3}
              className="w-full px-4 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
              placeholder="What did you eat? e.g. 'Chicken burrito bowl'"
            />
            <button onClick={() => analyzeText(manualText)} disabled={!manualText || loading} className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Analyze with AI'}
            </button>
          </div>
        )}

        {error && <div className="mt-4 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">{error}</div>}

        {/* Confirmation Card */}
        {mealData && (
          <div className="mt-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">AI Analysis</h2>
            {mealData.portionEstimate && (
              <p className="text-gray-400 text-sm mb-4">Portion: {mealData.portionEstimate}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {(['1/4', '1/2', '3/4', 'Full'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectPortion(option)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedPortion === option ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="space-y-3 mb-6">
              <EditableField label="Meal Name" value={mealData.foodName} onChange={v => updateMealField('foodName', v)} isText />
              <div className="grid grid-cols-2 gap-3">
                <EditableField label="Calories (kcal)" value={mealData.calories} onChange={v => updateMealField('calories', v)} />
                <EditableField label="Protein (g)" value={mealData.protein} onChange={v => updateMealField('protein', v)} />
                <EditableField label="Carbs (g)" value={mealData.carbs} onChange={v => updateMealField('carbs', v)} />
                <EditableField label="Fat (g)" value={mealData.fat} onChange={v => updateMealField('fat', v)} />
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-4">Feel free to adjust any values before saving.</p>
            <button onClick={saveMeal} disabled={saving} className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : 'Save to Dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function EditableField({ label, value, onChange, isText }: { label: string; value: string | number; onChange: (v: string) => void; isText?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input
        type={isText ? 'text' : 'number'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm font-medium"
      />
    </div>
  )
}
