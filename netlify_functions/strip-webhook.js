import Stripe from 'stripe';
import fetch from 'node-fetch';

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const handler = async (event) => {
  const sig = event.headers['stripe-signature'] || event.headers['Stripe-Signature'] || '';
  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let evt;
  try {
    evt = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (evt.type === 'payment_intent.succeeded') {
    const pi = evt.data.object;
    const email = pi.metadata && pi.metadata.email;
    if (email) {
      try {
        await fetch((process.env.BACKEND_URL || '') + '/api/auth/set-premium', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, adminKey: process.env.BACKEND_ADMIN_KEY })
        });
      } catch (e) {
        console.error('Failed to call backend set-premium', e);
      }
    }
  }

  return { statusCode: 200, body: 'ok' };
};
