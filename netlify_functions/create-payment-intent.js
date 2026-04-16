import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET);

export const handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || '{}');
    let customer;
    if (email) {
      const customers = await stripe.customers.list({ email, limit: 1 });
      customer = customers.data[0] || await stripe.customers.create({ email });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1000,
      currency: 'aud',
      automatic_payment_methods: { enabled: true },
      customer: customer ? customer.id : undefined,
      metadata: { email: email || '' }
    });

    return { statusCode: 200, body: JSON.stringify({ clientSecret: paymentIntent.client_secret }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
