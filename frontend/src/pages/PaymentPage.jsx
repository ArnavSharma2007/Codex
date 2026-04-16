import React from 'react';
import { getToken } from '../authFetch';

export default function PaymentPage() {
  const handleCheckout = async () => {
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + getToken() },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert('Failed to create checkout session');
    } catch (e) {
      console.error(e); alert('Error starting checkout');
    }
  };

  return (
    <div className="payment-container">
      <h2>Premium Plan Checkout</h2>
      <p>Click below to go to Stripe Checkout.</p>
      <button className="plan-button" onClick={handleCheckout}>Go to Stripe Checkout</button>
    </div>
  );
}