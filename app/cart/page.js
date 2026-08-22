'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatCurrency, getWhatsAppOrderUrl } from '@/lib/utils';
import { useState } from 'react';
import { showToast } from '@/components/Toast';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discount,
    shipping,
    total,
    coupon,
    applyCoupon,
    removeCoupon,
    clearCart
  } = useCart();

  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.toUpperCase() === 'WELCOME10') {
      applyCoupon({ code: 'WELCOME10', discount_type: 'percentage', discount_value: 10 });
      showToast('Coupon WELCOME10 applied! 10% OFF ✨');
    } else if (couponCode.toUpperCase() === 'AZEE20') {
      applyCoupon({ code: 'AZEE20', discount_type: 'percentage', discount_value: 20 });
      showToast('Coupon AZEE20 applied! 20% OFF 🎉');
    } else {
      showToast('Invalid coupon code');
    }
    setCouponCode('');
  };

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Shopping Cart</span>
        </div>
        <h1>Your Shopping Cart</h1>
        <p>Review your selected items before proceeding to checkout.</p>
      </div>

      <div className="shop-page" style={{ padding: '60px 0 100px' }}>
        <div className="container">
          {items.length === 0 ? (
            <div className="cart-empty" style={{ padding: '80px 24px', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-dark)' }}>
              <div className="cart-empty-icon">🛒</div>
              <h4>Your cart is currently empty</h4>
              <p style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
                Looks like you haven't added any handcrafted jewellery or pearl art to your cart yet.
              </p>
              <Link href="/shop" className="btn-primary">
                <span>Start Shopping</span>
              </Link>
            </div>
          ) : (
            <div className="checkout-layout">
              {/* Left Column: Item List */}
              <div>
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-dark)', padding: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-dark)' }}>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400 }}>Items ({items.length})</h3>
                    <button onClick={clearCart} style={{ fontSize: '13px', color: 'var(--rose)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Clear Cart
                    </button>
                  </div>

                  {items.map((item, i) => (
                    <div className="cart-item" key={`${item.id}-${item.variantId}-${i}`} style={{ padding: '20px 0' }}>
                      <img src={item.image} alt={item.name} className="cart-item-img" style={{ width: '90px', height: '90px' }} />
                      <div className="cart-item-info">
                        <Link href={`/shop/${item.slug}`} style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--text-primary)', textDecoration: 'none' }}>
                          {item.name}
                        </Link>
                        {item.variantInfo && <div className="cart-item-variant">{item.variantInfo}</div>}
                        {item.customization && (
                          <div className="cart-item-variant" style={{ color: 'var(--rose)', fontWeight: 500, fontSize: '12px', marginTop: '2px' }}>
                            ✨ Customization: "{item.customization}"
                          </div>
                        )}
                        <div className="cart-item-price" style={{ marginTop: '4px' }}>{formatCurrency(item.price)}</div>
                        <div className="cart-item-qty" style={{ marginTop: '12px' }}>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId, item.customization)}>−</button>
                          <span>{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId, item.customization)}>+</button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <button className="cart-item-remove" onClick={() => removeItem(item.id, item.variantId, item.customization)} title="Remove item">✕</button>
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href="/shop" className="btn-ghost">
                    ← Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="order-summary-card">
                <h3>Order Summary</h3>

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

                  {subtotal < 5000 && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', marginBottom: '12px' }}>
                      Add {formatCurrency(5000 - subtotal)} more for <strong>FREE shipping!</strong>
                    </p>
                  )}

                  <div className="summary-row total">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Coupon Code Form */}
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-dark)' }}>
                  {coupon ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-blush)', padding: '12px 16px', borderRadius: '8px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: 'var(--rose)', fontWeight: 600 }}>COUPON APPLIED</span>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{coupon.code}</div>
                      </div>
                      <button onClick={removeCoupon} style={{ fontSize: '12px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="coupon-input">
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. WELCOME10)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button type="submit">Apply</button>
                    </form>
                  )}
                </div>

                <div style={{ marginTop: '32px' }}>
                  <Link href="/checkout" className="btn-primary btn-block">
                    <span>Proceed to Checkout</span>
                  </Link>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  🔒 100% Safe & Secure Checkout
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
