'use client'

export const dynamic = 'force-dynamic'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera, Mic, PenLine, ArrowLeft, Upload, Loader2 } from 'lucide-react'
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser'
import Link from 'next/link'

interface MealData {
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  saturatedFat: number
  fiber: number
  sugar: number
  sodium: number
  portionEstimate: string
}

interface BarcodeProduct {
  code: string
  productName: string
  brand: string
  servingSize: string
  energyKcal100g: number
  proteins100g: number
  carbohydrates100g: number
  fat100g: number
  fiber100g: number
  sugars100g: number
  sodium100g: number
  saturatedFat100g: number
  energyKcalServing?: number
}

export default function LogPage() {
  const [tab, setTab] = useState<'photo' | 'barcode' | 'voice' | 'manual'>('photo')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [compressedImageFile, setCompressedImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [voiceText, setVoiceText] = useState('')
  const [manualText, setManualText] = useState('')
  const [manualNutrition, setManualNutrition] = useState({ fiber: 0, sugar: 0, sodium: 0, saturatedFat: 0 })
  const [mealData, setMealData] = useState<MealData | null>(null)
  const [fullMealData, setFullMealData] = useState<MealData | null>(null)
  const [selectedPortion, setSelectedPortion] = useState<'1/4' | '1/2' | '3/4' | 'Full'>('Full')
  const [selectedServings, setSelectedServings] = useState<0.5 | 1 | 1.5 | 2>(1)
  const [barcode, setBarcode] = useState('')
  const [manualBarcode, setManualBarcode] = useState('')
  const [barcodeProduct, setBarcodeProduct] = useState<BarcodeProduct | null>(null)
  const [barcodeError, setBarcodeError] = useState('')
  const [scanning, setScanning] = useState(false)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [scanFlash, setScanFlash] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingBarcode, setLoadingBarcode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const lastScannedRef = useRef<string | null>(null)
  const scanTimeoutRef = useRef<number | null>(null)
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

  function stopCameraScanning() {
    setScanning(false)
    setCameraLoading(false)
    if (scanTimeoutRef.current) {
      window.clearTimeout(scanTimeoutRef.current)
      scanTimeoutRef.current = null
    }

    if (videoRef.current?.srcObject instanceof MediaStream) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }

    controlsRef.current?.stop()
    controlsRef.current = null
    codeReaderRef.current = null
    lastScannedRef.current = null
  }

  async function startCameraScanning() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not available on this device.')
      return
    }

    setCameraError('')
    setPermissionDenied(false)
    setBarcodeError('')
    setBarcodeProduct(null)
    setCameraLoading(true)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })

      if (!videoRef.current) {
        stopCameraScanning()
        return
      }

      videoRef.current.srcObject = stream
      videoRef.current.setAttribute('playsinline', 'true')
      await videoRef.current.play()
      setScanning(true)

      const codeReader = new BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      controlsRef.current = await codeReader.decodeFromVideoElement(videoRef.current, async (result, error) => {
        if (result) {
          const decoded = result.getText()
          if (!decoded || lastScannedRef.current === decoded) return

          lastScannedRef.current = decoded
          stopCameraScanning()
          setScanFlash(true)
          scanTimeoutRef.current = window.setTimeout(() => setScanFlash(false), 500)

          setBarcode(decoded)
          await fetchBarcodeProduct(decoded)
        } else if (error) {
          console.warn('ZXing scan error:', error)
        }
      })
    } catch (err: unknown) {
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
          setPermissionDenied(true)
          setCameraError('Camera permission denied. Please enter the barcode manually.')
        } else if (err.name === 'NotFoundError') {
          setCameraError('No camera was found on this device.')
        } else {
          setCameraError('Unable to access the camera. Please try again or use manual entry.')
        }
      } else {
        setCameraError('Unable to access the camera. Please try again or use manual entry.')
      }
      stopCameraScanning()
    } finally {
      setCameraLoading(false)
    }
  }

  async function fetchBarcodeProduct(code: string) {
    setBarcodeError('')
    setBarcodeProduct(null)
    setSelectedServings(1)
    setLoadingBarcode(true)

    try {
      const res = await fetch(`/api/barcode-lookup?barcode=${encodeURIComponent(code)}`)
      const body = await res.json()
      if (!res.ok || body.error) {
        setBarcodeError('Product not found — try manual entry')
        return
      }

      setBarcodeProduct(body)
      setBarcodeError('')
    } catch (err) {
      console.error('Barcode lookup failed', err)
      setBarcodeError('Product not found — try manual entry')
    } finally {
      setLoadingBarcode(false)
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
      saturatedFat: Number((fullData.saturatedFat * multiplier).toFixed(1)),
      fiber: Number((fullData.fiber * multiplier).toFixed(1)),
      sugar: Number((fullData.sugar * multiplier).toFixed(1)),
      sodium: Math.round(fullData.sodium * multiplier),
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
        const merged = {
          fiber: manualNutrition.fiber || data.fiber || 0,
          sugar: manualNutrition.sugar || data.sugar || 0,
          sodium: manualNutrition.sodium || data.sodium || 0,
          saturatedFat: manualNutrition.saturatedFat || data.saturatedFat || 0,
          ...data,
        }
        setFullMealData(merged)
        setSelectedPortion('Full')
        setMealData(merged)
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
        const merged = {
          fiber: manualNutrition.fiber || data.fiber || 0,
          sugar: manualNutrition.sugar || data.sugar || 0,
          sodium: manualNutrition.sodium || data.sodium || 0,
          saturatedFat: manualNutrition.saturatedFat || data.saturatedFat || 0,
          ...data,
        }
        setFullMealData(merged)
        setSelectedPortion('Full')
        setMealData(merged)
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
      saturated_fat: mealData.saturatedFat,
      fiber: mealData.fiber,
      sugar: mealData.sugar,
      sodium: mealData.sodium,
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
    <div className="min-h-screen bg-primary text-white">
      <style>{`@keyframes scanLine { 0%, 100% { transform: translateX(-50%) translateY(0%); } 50% { transform: translateX(-50%) translateY(100%); } }`}</style>
      <div className="bg-primary border-b border-borderSlate">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-xl transition-colors hover:bg-surface">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-2xl font-black text-white">Log a Meal</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-surface p-1 rounded-2xl">
          {[
            { id: 'photo', label: 'Photo', icon: Camera },
            { id: 'barcode', label: 'Barcode', icon: Upload },
            { id: 'voice', label: 'Describe', icon: Mic },
            { id: 'manual', label: 'Manual', icon: PenLine },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTab(t.id as typeof tab)
                setMealData(null)
                setError('')
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                tab === t.id ? 'bg-primary text-white shadow-sm' : 'text-textSecondary'
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
              className="border-2 border-borderSlate rounded-3xl p-10 text-center cursor-pointer bg-surface2 hover:border-accent hover:bg-surface transition-all"
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Meal preview" className="max-h-64 mx-auto rounded-2xl object-cover" />
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-textSecondary mx-auto mb-3" />
                  <p className="text-textSecondary font-medium">Tap to upload a photo</p>
                  <p className="text-textSecondary text-sm mt-1">JPG, PNG, HEIC supported</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <p className="text-textSecondary text-sm">Works best with photos under 10MB</p>
            {imageFile && !mealData && (
              <button onClick={analyzePhoto} disabled={loading} className="w-full bg-accent hover:bg-accentSoft disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
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
              className="w-full px-4 py-4 rounded-2xl border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="Describe what you ate... e.g. 'Two scrambled eggs with whole wheat toast and a large glass of orange juice'"
            />
            <button onClick={() => analyzeText(voiceText)} disabled={!voiceText || loading} className="w-full bg-accent hover:bg-accentSoft disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Analyze with AI'}
            </button>
          </div>
        )}

        {/* Barcode Tab */}
        {tab === 'barcode' && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-borderSlate bg-surface p-6 text-center">
              <p className="text-white font-semibold text-lg mb-3">Scan a barcode with your camera</p>
              <div className="grid gap-3">
                {!scanning ? (
                  <button
                    type="button"
                    onClick={startCameraScanning}
                    disabled={cameraLoading}
                    className="w-full bg-accent hover:bg-accentSoft text-black font-bold py-4 rounded-3xl transition-colors flex items-center justify-center gap-3"
                  >
                    {cameraLoading ? 'Starting camera…' : 'Start Camera'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCameraScanning}
                    className="w-full bg-danger hover:bg-red-600 text-white font-bold py-4 rounded-3xl transition-colors"
                  >
                    Stop Camera
                  </button>
                )}
              </div>
              {cameraError && <div className="text-red-600 text-sm mt-3">{cameraError}</div>}
              {permissionDenied && (
                <div className="text-sm text-textSecondary mt-2">
                  Camera permission was denied. Use manual barcode entry below.
                </div>
              )}
            </div>

            {scanning && (
              <div className={`relative rounded-3xl overflow-hidden border ${scanFlash ? 'border-accent shadow-[0_0_0_6px_rgba(212,160,23,0.25)]' : 'border-borderSlate'} bg-black aspect-video`}>
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute left-1/2 h-0.5 w-2/3 bg-accent/80"
                    style={{ transform: 'translateX(-50%)', animation: 'scanLine 2s ease-in-out infinite' }}
                  />
                </div>
              </div>
            )}

            <p className="text-textSecondary text-sm">Point the camera at a barcode and hold steady until it is detected.</p>

            <div className="grid gap-3">
              <input
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                placeholder="Enter barcode manually"
                className={`w-full px-4 py-3 rounded-2xl border ${permissionDenied ? 'border-danger bg-[#3f1515]' : 'border-borderSlate bg-surface'} focus:outline-none focus:ring-2 focus:ring-accent text-sm text-textPrimary`}
              />
              <button
                type="button"
                onClick={() => manualBarcode && fetchBarcodeProduct(manualBarcode)}
                disabled={!manualBarcode || loadingBarcode}
                className="w-full bg-accent hover:bg-accentSoft disabled:opacity-50 text-black font-bold py-3 rounded-2xl transition-colors"
              >
                {loadingBarcode ? 'Looking up product…' : 'Lookup Product'}
              </button>
            </div>
            {barcodeError && <div className="text-red-600 text-sm">{barcodeError}</div>}
            {barcode && !barcodeProduct && !loadingBarcode && (
              <div className="text-sm text-textSecondary">Detected barcode: {barcode}</div>
            )}
            {barcodeProduct && (
              <div className="bg-surface rounded-3xl p-5 border border-borderSlate shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{barcodeProduct.productName}</h3>
                    <p className="text-textSecondary text-sm">{barcodeProduct.brand}</p>
                  </div>
                  <span className="text-sm text-textSecondary">{barcodeProduct.servingSize}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="bg-surface2 rounded-2xl p-4">
                    <p className="font-semibold text-white">Per 100g</p>
                    <p>Calories: {barcodeProduct.energyKcal100g}</p>
                    <p>Protein: {barcodeProduct.proteins100g}g</p>
                    <p>Carbs: {barcodeProduct.carbohydrates100g}g</p>
                    <p>Fat: {barcodeProduct.fat100g}g</p>
                    <p>Fiber: {barcodeProduct.fiber100g}g</p>
                    <p>Sugar: {barcodeProduct.sugars100g}g</p>
                    <p>Sodium: {Math.round(barcodeProduct.sodium100g * 1000)}mg</p>
                    <p>Saturated Fat: {barcodeProduct.saturatedFat100g}g</p>
                  </div>
                  <div className="bg-surface2 rounded-2xl p-4">
                    <p className="font-semibold text-white">Per Serving</p>
                    <p>Calories: {barcodeProduct.energyKcalServing ? barcodeProduct.energyKcalServing : '—'}</p>
                    <p>Protein: {barcodeProduct.energyKcalServing ? (barcodeProduct.proteins100g * 1).toFixed(1) : '—'}g</p>
                    <p>Carbs: {barcodeProduct.energyKcalServing ? (barcodeProduct.carbohydrates100g * 1).toFixed(1) : '—'}g</p>
                    <p>Fat: {barcodeProduct.energyKcalServing ? (barcodeProduct.fat100g * 1).toFixed(1) : '—'}g</p>
                    <p>Fiber: {barcodeProduct.energyKcalServing ? (barcodeProduct.fiber100g * 1).toFixed(1) : '—'}g</p>
                    <p>Sugar: {barcodeProduct.energyKcalServing ? (barcodeProduct.sugars100g * 1).toFixed(1) : '—'}g</p>
                    <p>Sodium: {barcodeProduct.energyKcalServing ? Math.round(barcodeProduct.sodium100g * 1000) : '—'}mg</p>
                    <p>Saturated Fat: {barcodeProduct.energyKcalServing ? barcodeProduct.saturatedFat100g.toFixed(1) : '—'}g</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[0.5, 1, 1.5, 2].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedServings(value as 0.5 | 1 | 1.5 | 2)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                        selectedServings === value ? 'bg-accent text-black' : 'bg-surface2 text-textPrimary hover:bg-surface'
                      }`}
                    >
                      {value}x
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!barcodeProduct) return
                    const calories = barcodeProduct.energyKcalServing
                      ? Math.round(barcodeProduct.energyKcalServing * selectedServings)
                      : Math.round(barcodeProduct.energyKcal100g * selectedServings)
                    const protein = Number((barcodeProduct.proteins100g * selectedServings).toFixed(1))
                    const carbs = Number((barcodeProduct.carbohydrates100g * selectedServings).toFixed(1))
                    const fat = Number((barcodeProduct.fat100g * selectedServings).toFixed(1))
                    const fiber = Number((barcodeProduct.fiber100g * selectedServings).toFixed(1))
                    const sugar = Number((barcodeProduct.sugars100g * selectedServings).toFixed(1))
                    const sodium = Math.round(barcodeProduct.sodium100g * 1000 * selectedServings)
                    const saturatedFat = Number((barcodeProduct.saturatedFat100g * selectedServings).toFixed(1))

                    setMealData({
                      foodName: barcodeProduct.productName,
                      calories,
                      protein,
                      carbs,
                      fat,
                      fiber,
                      sugar,
                      sodium,
                      saturatedFat,
                      portionEstimate: `${selectedServings} x ${barcodeProduct.servingSize}`,
                    })
                    setFullMealData({
                      foodName: barcodeProduct.productName,
                      calories,
                      protein,
                      carbs,
                      fat,
                      fiber,
                      sugar,
                      sodium,
                      saturatedFat,
                      portionEstimate: `${selectedServings} x ${barcodeProduct.servingSize}`,
                    })
                  }}
                  className="w-full bg-accent hover:bg-accentSoft text-black font-bold py-4 rounded-2xl transition-colors"
                >
                  Use Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Tab */}
        {tab === 'manual' && (
          <div className="space-y-4">
            <textarea
              value={manualText}
              onChange={e => setManualText(e.target.value)}
              rows={3}
              className="w-full px-4 py-4 rounded-2xl border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              placeholder="What did you eat? e.g. 'Chicken burrito bowl'"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="number"
                value={manualNutrition.fiber}
                onChange={e => setManualNutrition(prev => ({ ...prev, fiber: Number(e.target.value) }))}
                placeholder="Fiber (g)"
                className="w-full px-4 py-3 rounded-2xl border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              <input
                type="number"
                value={manualNutrition.sugar}
                onChange={e => setManualNutrition(prev => ({ ...prev, sugar: Number(e.target.value) }))}
                placeholder="Sugar (g)"
                className="w-full px-4 py-3 rounded-2xl border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              <input
                type="number"
                value={manualNutrition.sodium}
                onChange={e => setManualNutrition(prev => ({ ...prev, sodium: Number(e.target.value) }))}
                placeholder="Sodium (mg)"
                className="w-full px-4 py-3 rounded-2xl border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
              <input
                type="number"
                value={manualNutrition.saturatedFat}
                onChange={e => setManualNutrition(prev => ({ ...prev, saturatedFat: Number(e.target.value) }))}
                placeholder="Saturated Fat (g)"
                className="w-full px-4 py-3 rounded-2xl border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent text-sm"
              />
            </div>
            <button onClick={() => analyzeText(manualText)} disabled={!manualText || loading} className="w-full bg-accent hover:bg-accentSoft disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Analyze with AI'}
            </button>
          </div>
        )}

        {error && <div className="mt-4 bg-[#331111] text-danger px-4 py-3 rounded-xl text-sm">{error}</div>}

        {/* Confirmation Card */}
        {mealData && (
          <div className="mt-6 bg-surface rounded-3xl p-6 border border-borderSlate shadow-sm">
            <h2 className="text-lg font-bold text-white mb-1">AI Analysis</h2>
            {mealData.portionEstimate && (
              <p className="text-textSecondary text-sm mb-4">Portion: {mealData.portionEstimate}</p>
            )}
            <div className="flex flex-wrap gap-2 mb-4">
              {(['1/4', '1/2', '3/4', 'Full'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectPortion(option)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${selectedPortion === option ? 'bg-accent text-black' : 'bg-surface2 text-textSecondary hover:bg-surface'}`}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="space-y-3 mb-6">
              <EditableField label="Meal Name" value={mealData.foodName} onChange={v => updateMealField('foodName', v)} isText />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <EditableField label="Calories (kcal)" value={mealData.calories} onChange={v => updateMealField('calories', v)} />
                <EditableField label="Protein (g)" value={mealData.protein} onChange={v => updateMealField('protein', v)} />
                <EditableField label="Carbs (g)" value={mealData.carbs} onChange={v => updateMealField('carbs', v)} />
                <EditableField label="Fat (g)" value={mealData.fat} onChange={v => updateMealField('fat', v)} />
                <EditableField label="Saturated Fat (g)" value={mealData.saturatedFat} onChange={v => updateMealField('saturatedFat', v)} />
                <EditableField label="Fiber (g)" value={mealData.fiber} onChange={v => updateMealField('fiber', v)} />
                <EditableField label="Sugar (g)" value={mealData.sugar} onChange={v => updateMealField('sugar', v)} />
                <EditableField label="Sodium (mg)" value={mealData.sodium} onChange={v => updateMealField('sodium', v)} />
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-4">Feel free to adjust any values before saving.</p>
            <button onClick={saveMeal} disabled={saving} className="w-full bg-accent hover:bg-accentSoft disabled:opacity-50 text-black font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2">
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
      <label className="block text-xs font-semibold text-textSecondary mb-1">{label}</label>
      <input
        type={isText ? 'text' : 'number'}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl border border-borderSlate bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent text-sm font-medium"
      />
    </div>
  )
}
