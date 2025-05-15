// Backend/utils/stripe.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.verifyPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error("Failed to verify payment: " + error.message);
  }
};
