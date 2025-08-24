import React, { useState } from 'react';
import apiClient from '../../api/client';

const PaymentFormSimple = ({ items, shipping }) => {
  const [clientSecret, setClientSecret] = useState('');

  const createIntent = async () => {
    const { data } = await apiClient.post('/api/payments/create-payment-intent', { items, shipping });
    setClientSecret(data.clientSecret);
  };

  const payWithMpesa = async () => {
    await apiClient.post('/api/payments/mpesa-payment', { items, shipping });
  };

  return (
    <div>
      <button onClick={createIntent}>Create Stripe Intent</button>
      <button onClick={payWithMpesa}>Pay with M-Pesa</button>
      {clientSecret && <div>Client secret: {clientSecret}</div>}
    </div>
  );
};

export default PaymentFormSimple;