import { db } from '@/db'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import type Stripe from 'stripe'

type MinimalSubscription = {
  id: string
  customer: string | { id: string }
  items: { data: { price: { id: string } }[] }
  current_period_end?: number
}

type MinimalInvoice = {
  subscription?: string | { id: string }
}

export async function POST(request: Request) {
  const body = await request.text()
  const signature = (await headers()).get('Stripe-Signature') ?? ''

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err) {
    return new Response(
      `Webhook Error: ${
        err instanceof Error ? err.message : 'Unknown Error'
      }`,
      { status: 400 }
    )
  }

  const session = event.data
    .object as Stripe.Checkout.Session

  if (!session?.metadata?.userId) {
    return new Response(null, {
      status: 200,
    })
  }

  if (event.type === 'checkout.session.completed') {
    const subscription = (await stripe.subscriptions.retrieve(
      session.subscription as string
    )) as unknown as MinimalSubscription

    await db.user.update({
      where: {
        id: session.metadata.userId,
      },
      data: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: (typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id),
        stripePriceId: subscription.items.data[0]?.price.id,
        stripeCurrentPeriodEnd: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : null,
      },
    })
  }

  if (event.type === 'invoice.payment_succeeded') {
    // Retrieve the subscription details from Stripe.
    const invoice = event.data.object as unknown as MinimalInvoice
    const subscriptionId = typeof invoice.subscription === 'string'
      ? invoice.subscription
      : invoice.subscription?.id

    if (!subscriptionId) {
      return new Response(null, { status: 200 })
    }

    const subscription = (await stripe.subscriptions.retrieve(subscriptionId)) as unknown as MinimalSubscription

    const stripeCustomerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id

    const user = await db.user.findFirst({
      where: { stripeCustomerId }
    })

    if (user) {
      await db.user.update({
        where: { id: user.id },
        data: {
          stripePriceId: subscription.items.data[0]?.price.id,
          stripeCurrentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null,
        },
      })
    }
  }

  return new Response(null, { status: 200 })
}