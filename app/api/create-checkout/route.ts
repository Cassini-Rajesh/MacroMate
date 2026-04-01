import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: sub } = await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).single()

    const session = await stripe.checkout.sessions.create({
      customer: sub?.stripe_customer_id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'MacroMate Pro' },
          unit_amount: 999,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'}/subscribe`,
      metadata: { supabaseUserId: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }
}
