import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json()

    const customer = await stripe.customers.create({ email, metadata: { supabaseUserId: userId } })

    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    const supabase = createAdminClient()
    await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_customer_id: customer.id,
      status: 'trialing',
      trial_ends_at: trialEndsAt.toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create trial' }, { status: 500 })
  }
}
