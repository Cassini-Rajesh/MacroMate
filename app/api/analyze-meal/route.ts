import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropicApiKey = process.env.ANTHROPIC_API_KEY
if (!anthropicApiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable')
}

const anthropic = new Anthropic({ apiKey: anthropicApiKey })

const PHOTO_SYSTEM_PROMPT = `You are a precise nutrition expert with deep knowledge of USDA food composition data. When analyzing a food photo, follow this exact reasoning process:

1. IDENTIFY: Name every distinct food item visible in the image
2. ESTIMATE SIZE: Use visual reference points to estimate weight in grams. A standard chicken breast is 150-180g. A cup of rice is 180g cooked. A slice of bread is 30g. A burger patty is 100-120g. Use these anchors to calibrate your estimates.
3. LOOK UP: Recall the standard nutrition per 100g for each item from USDA data
4. CALCULATE: Multiply nutrition per 100g by estimated weight
5. SUM: Add up all items for the total

Common USDA values to use:
- Cooked chicken breast: 165 cal, 31g protein, 0g carbs, 3.6g fat per 100g
- Cooked white rice: 130 cal, 2.7g protein, 28g carbs, 0.3g fat per 100g
- Cooked pasta: 158 cal, 5.8g protein, 31g carbs, 0.9g fat per 100g
- Ground beef 80/20 cooked: 254 cal, 26g protein, 0g carbs, 17g fat per 100g
- Scrambled eggs: 149 cal, 10g protein, 1.6g carbs, 11g fat per 100g
- White bread slice: 79 cal, 2.7g protein, 15g carbs, 1g fat per 100g
- Broccoli cooked: 35 cal, 2.4g protein, 7g carbs, 0.4g fat per 100g
- Cheddar cheese: 403 cal, 25g protein, 1.3g carbs, 33g fat per 100g
- Olive oil: 884 cal, 0g protein, 0g carbs, 100g fat per 100g
- Banana medium: 89 cal, 1.1g protein, 23g carbs, 0.3g fat per 100g

For restaurant or fast food items you recognize (McDonald's, Chick-fil-A, Chipotle, Subway, etc.), use their official published nutrition data instead of estimating.

Return ONLY a valid JSON object with no markdown, no code fences:
{
  foodName: string (descriptive name of the full meal),
  calories: number (rounded to nearest 5),
  protein: number (rounded to nearest gram),
  carbs: number (rounded to nearest gram),
  fat: number (rounded to nearest gram),
  saturatedFat: number (rounded to nearest gram),
  fiber: number (rounded to nearest gram),
  sugar: number (rounded to nearest gram),
  sodium: number (rounded to nearest mg),
  portionEstimate: string (one line: what you see and estimated total weight)
}`

const TEXT_SYSTEM_PROMPT = `You are a precise nutrition expert. The user has described a meal they ate. Analyze the described meal as one full serving. Return ONLY a valid JSON object with no markdown, no code fences, no extra text whatsoever:
{
  foodName: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  saturatedFat: number,
  fiber: number,
  sugar: number,
  sodium: number,
  portionEstimate: string
}
The portionEstimate should be a simple one-line description like Full plate of pasta approximately 600g. The numbers should represent the FULL portion described.`

function cleanJsonString(raw: string) {
  return raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/\s*```$/, '')
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') ?? ''

    if (contentType.includes('multipart/form-data')) {
      // Photo analysis
      const formData = await req.formData()
      const imageFile = formData.get('image') as File
      if (!imageFile) return NextResponse.json({ error: 'No image provided' }, { status: 400 })

      const bytes = await imageFile.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mediaType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'

      const response = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 512,
        system: PHOTO_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [{
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          }],
        }],
      })

      const text = Array.isArray(response.content) && response.content[0]?.type === 'text'
        ? response.content[0].text
        : ''

      if (!text) {
        throw new Error('Anthropic returned no text content for image analysis')
      }

      const cleaned = cleanJsonString(text)
      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch (parseError) {
        throw new Error(`Failed to parse Anthropic response: ${String(parseError)} | raw: ${cleaned}`)
      }

      return NextResponse.json(parsed)
    } else {
      // Text analysis
      const { text } = await req.json()
      if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

      const response = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 512,
        system: TEXT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      })

      const responseText = Array.isArray(response.content) && response.content[0]?.type === 'text'
        ? response.content[0].text
        : ''

      if (!responseText) {
        throw new Error('Anthropic returned no text content for text analysis')
      }

      const cleaned = cleanJsonString(responseText)
      let parsed
      try {
        parsed = JSON.parse(cleaned)
      } catch (parseError) {
        throw new Error(`Failed to parse Anthropic response: ${String(parseError)} | raw: ${cleaned}`)
      }

      return NextResponse.json(parsed)
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Failed to analyze meal'
    console.error('Anthropic analyze error:', err)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
