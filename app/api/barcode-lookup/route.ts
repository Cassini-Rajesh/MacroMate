import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get('barcode')
  if (!barcode) {
    return NextResponse.json({ error: 'Missing barcode query parameter' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`)
    if (!response.ok) {
      throw new Error(`Open Food Facts request failed: ${response.status}`)
    }

    const body = await response.json()
    if (body?.status !== 1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = body.product || {}
    const nutriments = product.nutriments || {}
    const sodium100g = Number(nutriments.sodium_100g || 0)

    return NextResponse.json({
      code: barcode,
      productName: product.product_name || 'Unknown product',
      brand: product.brands || 'Unknown brand',
      servingSize: product.serving_size || '1 serving',
      energyKcal100g: Number(nutriments['energy-kcal_100g'] || nutriments.energy_100g || 0),
      proteins100g: Number(nutriments.proteins_100g || 0),
      carbohydrates100g: Number(nutriments.carbohydrates_100g || 0),
      fat100g: Number(nutriments.fat_100g || 0),
      fiber100g: Number(nutriments.fiber_100g || 0),
      sugars100g: Number(nutriments.sugars_100g || nutriments.sugar_100g || 0),
      sodium100g,
      saturatedFat100g: Number(nutriments['saturated-fat_100g'] || nutriments.saturated_fat_100g || 0),
      energyKcalServing: nutriments['energy-kcal_serving'] ? Number(nutriments['energy-kcal_serving']) : nutriments.energy_serving ? Number(nutriments.energy_serving) : null,
    })
  } catch (error) {
    console.error('Barcode lookup route error:', error)
    return NextResponse.json({ error: 'Barcode lookup failed' }, { status: 500 })
  }
}
