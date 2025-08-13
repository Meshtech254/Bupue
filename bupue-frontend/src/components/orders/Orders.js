import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('/api/orders/my');
        setOrders(res.data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="orders-container">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="orders-container">
      <h2>My Orders</h2>
      {orders.length === 0 && <div>No orders found.</div>}
      {orders.map(order => (
        <div key={order._id} className="order-card">
          <div><strong>Order ID:</strong> {order._id}</div>
          <div><strong>Status:</strong> {order.status}</div>
          <div><strong>Total:</strong> ${order.total.toFixed(2)}</div>
          <div><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</div>
          <div><strong>Shipping:</strong> {order.shipping?.name}, {order.shipping?.address}, {order.shipping?.city}, {order.shipping?.country}, {order.shipping?.postalCode}</div>
          <div className="order-items">
            <strong>Items:</strong>
            <ul>
              {order.items.map((oi, idx) => (
                <li key={idx}>{oi.quantity} x {oi.item?.title || 'Item'} @ ${oi.price}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Orders; 