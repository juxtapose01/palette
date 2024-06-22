import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  'pk_test_51PMEXRD2Om8kn3t3EkJEloAOE7FzcerzplbAfV8s1Y3JB0bOf0kdZLBkjrtjQEIXBd3Mf3SB7kJTqsvrBWzfY8Tk00VMLprYCe'
);

export const orderPainting = async (paintingId) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:3000/api/v1/orders/checkout-session/${paintingId}`
    );
    const session = response.data.session;

    // Ensure stripePromise is initialized correctly
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe initialization failed');
    }

    // Initiate redirect to Stripe checkout
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    // Log result after the redirect call
    console.log('Redirect result:', result);

    // Check for errors in the result
    if (result.error) {
      console.error('Stripe Error:', result.error.message);
      alert('There was an error processing your request. Please try again.');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('There was an error processing your request.');
  }
};

export const orderCustomPainting = async (customPaintId) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:3000/api/v1/custom-orders/checkout-session-shoe/${customPaintId}`
    );

    const session = await response.data.session;
    console.log(session);
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      console.error('Stripe Error:', error.message);

      alert('There was an error processing your request. Please try again.');
    }
  } catch (err) {
    console.error(
      'Request Error:',
      err.response ? err.response.data : err.message
    );
    alert('There was an error processing your request. Please try again.');
  }
};
