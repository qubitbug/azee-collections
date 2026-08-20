'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { formatCurrency } from '@/lib/utils';

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    if (orderNumber && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`azee_order_${orderNumber}`);
      if (saved) {
        setOrderDetails(JSON.parse(saved));
      }
    }
  }, [orderNumber]);

  return (
    <div className="order-success">
      <div className="container" style={{ maxWidth: '650px' }}>
        <div className="success-icon">✨</div>
        <h1>Thank You For Your Order!</h1>
        <p>Your order has been placed successfully and is now being handcrafted by our artisans.</p>
        
        {orderNumber && (
          <div className="order-id">
            Order #: <strong>{orderNumber}</strong>
          </div>
        )}

        {orderDetails && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-dark)', borderRadius: 'var(--radius)', padding: '24px', textAlign: 'left', marginBottom: '32px' }}>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '8px' }}>
              Order Details
            </h4>
            
            <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Customer:</strong> {orderDetails.customer.fullName}</p>
            <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Phone:</strong> {orderDetails.customer.phone}</p>
            <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Delivery Address:</strong> {orderDetails.customer.address}, {orderDetails.customer.city}, {orderDetails.customer.province}</p>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}><strong>Payment Method:</strong> {orderDetails.paymentMethod.toUpperCase()}</p>

            <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '12px' }}>
              {orderDetails.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-dark)', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '16px' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--rose)' }}>{formatCurrency(orderDetails.pricing.total)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <Link href="/shop" className="btn-primary">
            <span>Continue Shopping</span>
          </Link>
          <Link href="/account/orders" className="btn-ghost">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="order-success"><div className="container">Loading order confirmation...</div></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
