'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const past = JSON.parse(localStorage.getItem('azee_past_orders') || '[]');
      setOrders(past);
    }
  }, []);

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/account">Account</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Order History</span>
        </div>
        <h1>Order History</h1>
        <p>Track and view past orders placed with Azee Collections.</p>
      </div>

      <div className="account-page">
        <div className="container">
          <div className="account-layout">
            {/* Sidebar Navigation */}
            <aside className="account-sidebar">
              <div className="account-nav">
                <Link href="/account" className="account-nav-link">
                  👤 Profile & Details
                </Link>
                <Link href="/account/orders" className="account-nav-link active">
                  📦 Order History ({orders.length})
                </Link>
                <Link href="/account/wishlist" className="account-nav-link">
                  ♡ Saved Wishlist
                </Link>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="account-content">
              {orders.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', padding: '60px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--border-dark)', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '8px' }}>No Orders Found</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You haven't placed any orders with us yet.</p>
                  <Link href="/shop" className="btn-primary">
                    <span>Explore Collection</span>
                  </Link>
                </div>
              ) : (
                <div>
                  {orders.map((order, i) => (
                    <div className="order-card" key={i}>
                      <div className="order-header">
                        <div>
                          <div className="order-number">Order #{order.orderNumber}</div>
                          <div className="order-date">
                            Placed on {new Date(order.date).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                        </div>
                        <span className="order-status status-processing">Processing</span>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-dark)', borderBottom: '1px solid var(--border-dark)', padding: '16px 0', margin: '16px 0' }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: idx === order.items.length - 1 ? 0 : '12px' }}>
                            <img src={item.image} alt={item.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500, fontSize: '14px' }}>{item.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.quantity} × {formatCurrency(item.price)}</div>
                            </div>
                            <div style={{ fontWeight: 500, fontSize: '14px' }}>
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                          Payment: <strong style={{ textTransform: 'uppercase' }}>{order.paymentMethod}</strong>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 600 }}>
                          Total: <span style={{ color: 'var(--rose)' }}>{formatCurrency(order.pricing.total)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
