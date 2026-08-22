'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, generateOrderNumber, getWhatsAppOrderUrl } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/Toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shipping, total, coupon, clearCart } = useCart();
  const { user, profile } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: user?.email || '',
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address_line1 || '',
    city: profile?.city || 'Lahore',
    province: profile?.state || 'Punjab',
    postalCode: profile?.postal_code || '',
    notes: '',
    paymentMethod: 'cod', // 'cod' | 'bank' | 'payoneer'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.email || !formData.fullName || !formData.phone || !formData.address || !formData.city) {
        showToast('Please fill in all required shipping fields');
        return;
      }
      setStep(2);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderNum = generateOrderNumber();

    const orderDetails = {
      orderNumber: orderNum,
      customer: formData,
      items,
      pricing: { subtotal, discount, shipping, total },
      paymentMethod: formData.paymentMethod,
      date: new Date().toISOString(),
    };

    // Save order in localStorage for demo / order confirmation display
    if (typeof window !== 'undefined') {
      localStorage.setItem(`azee_order_${orderNum}`, JSON.stringify(orderDetails));
      // Add to past orders list
      const pastOrders = JSON.parse(localStorage.getItem('azee_past_orders') || '[]');
      pastOrders.unshift(orderDetails);
      localStorage.setItem('azee_past_orders', JSON.stringify(pastOrders));
    }

    // Sync order to Supabase Cloud
    supabase.from('orders').insert([{
      order_number: orderNum,
      user_id: user?.id || null,
      customer_email: formData.email,
      customer_name: `${formData.firstName} ${formData.lastName}`,
      customer_phone: formData.phone,
      shipping_address: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
      },
      payment_method: formData.paymentMethod,
      subtotal: subtotal,
      shipping_fee: shipping,
      total_amount: total,
      items: items,
    }]).then(({ error }) => {
      if (error) console.log('Supabase order insert note:', error.message);
    });

    setTimeout(() => {
      if (formData.paymentMethod === 'whatsapp') {
        const waUrl = getWhatsAppOrderUrl(items, subtotal, shipping);
        window.open(waUrl, '_blank');
      }
      clearCart();
      showToast('Order placed successfully! 🎉');
      router.push(`/order-confirmation?order=${orderNum}`);
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="not-found" style={{ minHeight: '60vh' }}>
        <h2>Your Cart is Empty</h2>
        <p>You cannot checkout with an empty cart.</p>
        <Link href="/shop" className="btn-primary">
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/cart">Cart</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Checkout</span>
        </div>
        <h1>Checkout</h1>
        <p>Complete your order securely with Azee Collections.</p>
      </div>

      <div className="checkout-page">
        <div className="container">
          <div className="checkout-layout">
            {/* Left Column: Form Steps */}
            <div>
              {/* Step Bar */}
              <div className="checkout-steps">
                <div className={`checkout-step ${step === 1 ? 'active' : 'done'}`}>
                  <div className="step-number">1</div>
                  <span>Shipping & Contact</span>
                </div>
                <span className="step-arrow">→</span>
                <div className={`checkout-step ${step === 2 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <span>Payment Method</span>
                </div>
              </div>

              {step === 1 && (
                <form onSubmit={handleNextStep} className="auth-card" style={{ maxWidth: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '24px' }}>
                    1. Contact & Delivery Address
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        required
                        placeholder="Ayesha Khan"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="0300 1234567"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="House/Apartment #, Street name, Sector/Area"
                      value={formData.address}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <select name="city" value={formData.city} onChange={handleChange} className="form-input">
                        <option value="Lahore">Lahore</option>
                        <option value="Karachi">Karachi</option>
                        <option value="Islamabad">Islamabad</option>
                        <option value="Rawalpindi">Rawalpindi</option>

                        <option value="Multan">Multan</option>
                        <option value="Faisalabad">Faisalabad</option>
                        <option value="Peshawar">Peshawar</option>
                        <option value="Quetta">Quetta</option>
                        <option value="Sialkot">Sialkot</option>
                        <option value="Gujranwala">Gujranwala</option>
                        <option value="Other">Other City</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Province *</label>
                      <select name="province" value={formData.province} onChange={handleChange} className="form-input">
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="KPK">Khyber Pakhtunkhwa</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="Federal">Islamabad Capital Territory</option>
                        <option value="AJK">Azad Jammu & Kashmir</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order Notes / Instructions (Optional)</label>
                    <textarea
                      name="notes"
                      rows="3"
                      placeholder="Special delivery instructions or customization requests..."
                      value={formData.notes}
                      onChange={handleChange}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button type="submit" className="btn-primary">
                      <span>Continue to Payment →</span>
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handlePlaceOrder} className="auth-card" style={{ maxWidth: '100%' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '24px' }}>
                    2. Select Payment Method
                  </h3>

                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'cod' }))}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${formData.paymentMethod === 'cod' ? 'var(--rose)' : 'var(--border-dark)'}`,
                      background: formData.paymentMethod === 'cod' ? 'var(--bg-blush)' : 'var(--bg-card)',
                      marginBottom: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleChange}
                        style={{ accentColor: 'var(--rose)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                          💵 Cash on Delivery (COD)
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Pay with cash upon receiving your parcel at your doorstep across Pakistan.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Transfer / JazzCash */}
                  <div
                    onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'bank' }))}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${formData.paymentMethod === 'bank' ? 'var(--rose)' : 'var(--border-dark)'}`,
                      background: formData.paymentMethod === 'bank' ? 'var(--bg-blush)' : 'var(--bg-card)',
                      marginBottom: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank"
                        checked={formData.paymentMethod === 'bank'}
                        onChange={handleChange}
                        style={{ accentColor: 'var(--rose)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)' }}>
                          🏦 Direct Bank Transfer / JazzCash
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Transfer directly to our Meezan Bank or JazzCash account. Account details provided below.
                        </div>
                      </div>
                    </div>
                    {formData.paymentMethod === 'bank' && (
                      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '13px', color: 'var(--text-body)' }}>
                        <p><strong>Bank & Mobile Account Details:</strong></p>
                        <p>• <strong>Meezan Bank:</strong> Azee Collections (A/C: 0102-010482910)</p>
                        <p>• <strong>JazzCash:</strong> 0346-2910394</p>
                        <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          * Send payment transaction screenshot on WhatsApp +92 3462910394 with your Order # for instant dispatch confirmation.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Order Option */}
                  <div
                    onClick={() => setFormData((p) => ({ ...p, paymentMethod: 'whatsapp' }))}
                    style={{
                      padding: '20px',
                      borderRadius: '12px',
                      border: `2px solid ${formData.paymentMethod === 'whatsapp' ? '#25D366' : 'var(--border-dark)'}`,
                      background: formData.paymentMethod === 'whatsapp' ? '#eefbf3' : 'var(--bg-card)',
                      marginBottom: '32px',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="whatsapp"
                        checked={formData.paymentMethod === 'whatsapp'}
                        onChange={handleChange}
                        style={{ accentColor: '#25D366' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '15px', color: '#128C7E' }}>
                          💬 Order & Confirm via WhatsApp
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Place order & immediately message us on WhatsApp with your pre-filled cart receipt for fast confirmation!
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button type="button" className="btn-ghost" onClick={() => setStep(1)}>
                      ← Back to Shipping
                    </button>

                    <button type="submit" className="btn-primary" disabled={loading}>
                      <span>{loading ? 'Processing Order...' : `Place Order — ${formatCurrency(total)}`}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right Column: Order Summary */}
            <div className="order-summary-card">
              <h3>Order Summary ({items.length})</h3>

              <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                {items.map((item, i) => (
                  <div className="summary-item" key={`${item.id}-${item.variantId}-${i}`}>
                    <img src={item.image} alt={item.name} className="summary-item-img" />
                    <div className="summary-item-info">
                      <div className="summary-item-name">{item.name}</div>
                      {item.customization && (
                        <div style={{ fontSize: '11px', color: 'var(--rose)', fontWeight: 500 }}>
                          ✨ Custom: "{item.customization}"
                        </div>
                      )}
                      <div className="summary-item-qty">Qty: {item.quantity}</div>
                    </div>
                    <div className="summary-item-price">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>

                {coupon && (
                  <div className="summary-row discount">
                    <span>Discount ({coupon.code})</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}

                <div className="summary-row">
                  <span>Shipping Fee</span>
                  <span>{shipping === 0 ? <strong style={{ color: 'var(--success)' }}>FREE</strong> : formatCurrency(shipping)}</span>
                </div>

                <div className="summary-row total">
                  <span>Total Payable</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
