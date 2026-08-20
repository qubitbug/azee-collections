'use client';

import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { fallbackProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { items } = useWishlist();

  const wishlistedProducts = fallbackProducts.filter(p => items.includes(p.id));

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/account">Account</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Saved Wishlist</span>
        </div>
        <h1>My Wishlist</h1>
        <p>Your saved favourite jewellery pieces & pearl artwork.</p>
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
                <Link href="/account/orders" className="account-nav-link">
                  📦 Order History
                </Link>
                <Link href="/account/wishlist" className="account-nav-link active">
                  ♡ Saved Wishlist ({wishlistedProducts.length})
                </Link>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="account-content">
              {wishlistedProducts.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', padding: '60px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--border-dark)', textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>♡</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '8px' }}>Your Wishlist is Empty</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Save your favourite items by clicking the heart icon on any product card.</p>
                  <Link href="/shop" className="btn-primary">
                    <span>Explore Products</span>
                  </Link>
                </div>
              ) : (
                <div className="products-grid">
                  {wishlistedProducts.map(p => (
                    <ProductCard key={p.id} product={p} />
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
