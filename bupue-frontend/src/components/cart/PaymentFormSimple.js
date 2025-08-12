import React, { useState } from 'react';
import axios from 'axios';

const PaymentFormSimple = ({ orderId, amount, onPaymentSuccess, onPaymentError }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const token = localStorage.getItem('token');
      
      if (paymentMethod === 'stripe') {
        // Create payment intent
        const { data } = await axios.post('/api/payments/create-payment-intent', 
          { orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // In a real app, you'd redirect to Stripe Checkout or use Stripe Elements
        // For now, we'll simulate a successful payment
        alert(`Payment Intent Created!\nAmount: $${amount.toFixed(2)}\nClient Secret: ${data.clientSecret.substring(0, 20)}...`);
        
        // Simulate successful payment (remove this in production)
        onPaymentSuccess();
      } else if (paymentMethod === 'mpesa') {
        const phoneNumber = prompt('Enter your M-Pesa phone number:');
        if (!phoneNumber) return;

        await axios.post('/api/payments/mpesa-payment', 
          { orderId, phoneNumber },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        alert('M-Pesa payment initiated! Check your phone for the payment prompt.');
        onPaymentSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Payment failed';
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-form">
      <h4>Choose Payment Method</h4>
      
      <div className="payment-methods">
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="stripe"
            checked={paymentMethod === 'stripe'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Credit/Debit Card (Stripe)
        </label>
        
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="mpesa"
            checked={paymentMethod === 'mpesa'}
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          M-Pesa Mobile Payment
        </label>
      </div>

      {paymentMethod === 'stripe' && (
        <div className="stripe-info">
          <p>💳 You will be redirected to Stripe for secure payment processing.</p>
          <p><strong>Test Card:</strong> 4242 4242 4242 4242 (any future date, any CVC)</p>
        </div>
      )}

      {paymentMethod === 'mpesa' && (
        <div className="mpesa-info">
          <p>📱 M-Pesa payment will send a prompt to your phone.</p>
          <p><strong>Format:</strong> 254XXXXXXXXX (Kenyan number)</p>
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="payment-button"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </div>
  );
};

export default PaymentFormSimple;

