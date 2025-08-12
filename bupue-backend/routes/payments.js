const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Create payment intent for Stripe
router.post('/create-payment-intent', auth, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId).populate('items.item');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the order belongs to the user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user.id
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: order.total
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ message: 'Failed to create payment intent' });
  }
});

// Stripe webhook handler
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;
      
      try {
        // Update order status to paid
        await Order.findByIdAndUpdate(orderId, { 
          status: 'paid',
          paymentDetails: {
            stripePaymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            paidAt: new Date()
          }
        });
        console.log(`Order ${orderId} marked as paid`);
      } catch (error) {
        console.error('Error updating order status:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      const failedOrderId = failedPayment.metadata.orderId;
      
      try {
        await Order.findByIdAndUpdate(failedOrderId, { 
          status: 'payment_failed',
          paymentDetails: {
            stripePaymentIntentId: failedPayment.id,
            error: failedPayment.last_payment_error?.message || 'Payment failed'
          }
        });
        console.log(`Order ${failedOrderId} payment failed`);
      } catch (error) {
        console.error('Error updating failed order:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// M-Pesa payment integration (placeholder for now)
router.post('/mpesa-payment', auth, async (req, res) => {
  try {
    const { orderId, phoneNumber } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the order belongs to the user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // TODO: Implement M-Pesa Daraja API integration
    // This is a placeholder - you'll need to implement actual M-Pesa integration
    // based on Safaricom's Daraja API documentation

    res.json({
      message: 'M-Pesa payment initiated',
      orderId: order._id,
      amount: order.total,
      phoneNumber: phoneNumber
    });
  } catch (error) {
    console.error('M-Pesa payment error:', error);
    res.status(500).json({ message: 'Failed to initiate M-Pesa payment' });
  }
});

// Get payment status
router.get('/status/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the order belongs to the user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({
      orderId: order._id,
      status: order.status,
      total: order.total,
      paymentDetails: order.paymentDetails
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ message: 'Failed to get payment status' });
  }
});

module.exports = router;

