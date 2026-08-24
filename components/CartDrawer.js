'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { formatCurrency, getWhatsAppOrderUrl } from '@/lib/utils';

export default function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQuantity,
    subtotal, shipping, itemCount
  } = useCart();

  const freeShippingThreshold = 5000;
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? 'open' : ''}`} onClick={closeCart} />
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h3>Your Cart ({itemCount})</h3>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-blush)',
              color: 'var(--rose-deep)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h4>Your cart is empty</h4>
            <p>Discover our handcrafted jewellery collection and find your perfect piece.</p>
            <Link href="/shop" className="btn-primary" onClick={closeCart}>
              <span>Shop Now</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item, i) => (
                <div className="cart-item" key={`${item.id}-${item.variantId}-${i}`}>
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    {item.variantInfo && <div className="cart-item-variant">{item.variantInfo}</div>}
                    {item.customization && (
                      <div className="cart-item-variant" style={{ color: 'var(--rose)', fontWeight: 500 }}>
                        ✨ Customization: "{item.customization}"
                      </div>
                    )}
                    <div className="cart-item-price">{formatCurrency(item.price)}</div>
                    <div className="cart-item-qty">
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1, item.variantId, item.customization)}>−</button>
                      <span>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1, item.variantId, item.customization)}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeItem(item.id, item.variantId, item.customization)}>✕</button>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer">
              {subtotal < freeShippingThreshold && (
                <>
                  <div className="free-shipping-bar">
                    <div className="free-shipping-bar-fill" style={{ width: `${freeShippingProgress}%` }} />
                  </div>
                  <p className="free-shipping-text">
                    Add {formatCurrency(freeShippingThreshold - subtotal)} more for <strong>FREE shipping!</strong>
                  </p>
                </>
              )}
              {subtotal >= freeShippingThreshold && (
                <p className="free-shipping-text" style={{ color: 'var(--success)' }}>🎉 You qualify for FREE shipping!</p>
              )}
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '16px' }}>
                Shipping & taxes calculated at checkout
              </p>
              <Link href="/checkout" className="btn-primary btn-block" onClick={closeCart} style={{ marginBottom: '8px' }}>
                <span>Checkout — {formatCurrency(subtotal)}</span>
              </Link>
              <Link href="/cart" className="btn-ghost btn-block" onClick={closeCart}>
                View Cart
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
