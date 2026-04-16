const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

let stripe;

if (process.env.NODE_ENV === 'test') {
  console.log('Using MOCK Stripe (CI mode)');

  stripe = {
    checkout: {
      sessions: {
        create: async () => ({
          id: 'mock-session-id',
          url: 'http://localhost:3000/success'
        })
      }
    }
  };

} else {
  stripe = new Stripe(process.env.STRIPE_SECRET);
}

router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: { name: 'Dev@Deakin: Codex Premium Plan' },
          unit_amount: 1000,
        },
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/plans`,
      metadata: { email: req.user.email }
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.metadata && session.metadata.email;
    if (email) {
      try {
        await User.findOneAndUpdate({ email }, { isPremium: true });
        console.log(`Upgraded ${email} to premium via webhook`);
      } catch (e) {
        console.error('Failed to upgrade user', e);
      }
    }
  }

  res.json({ received: true });
});

module.exports = router;
