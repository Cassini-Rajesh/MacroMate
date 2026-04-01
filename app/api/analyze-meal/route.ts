import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropicApiKey = process.env.ANTHROPIC_API_KEY
if (!anthropicApiKey) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable')
}

const anthropic = new Anthropic({ apiKey: anthropicApiKey })

const PHOTO_SYSTEM_PROMPT = `You are a nutrition expert. The user has uploaded a photo of their meal. Analyze the entire portion visible in the photo as one full serving. Return ONLY a valid JSON object with no markdown, no code fences, no extra text whatsoever:
{
  foodName: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  portionEstimate: string
}
The portionEstimate should be a simple one-line description like Full plate of pasta approximately 600g. The numbers should represent the FULL portion shown in the photo.`

const TEXT_SYSTEM_PROMPT = `You are a nutrition expert. The user has described a meal they ate. Analyze the described meal as one full serving. Return ONLY a valid JSON object with no markdown, no code fences, no extra text whatsoever:
{
  foodName: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
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
