import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, name, age, weightLbs, heightInches, goal } = await req.json()

    if (!userId || !name || !age || !weightLbs || !heightInches || !goal) {
      return NextResponse.json({ error: 'Missing required profile fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('users').insert({
      id: userId,
      name,
      age: parseInt(age, 10),
      weight_lbs: parseInt(weightLbs, 10),
      height_inches: parseInt(heightInches, 10),
      goal,
    })

    if (error) {
      console.error('Create profile error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Create profile request failed:', err)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}
