'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatCurrency, getSavingsPercent } from '@/lib/utils';
import { showToast } from './Toast';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    showToast(`${product.name} added to cart! 🛒`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = await toggleWishlist(product.id);
    showToast(added ? 'Added to wishlist ♡' : 'Removed from wishlist');
  };

  const savings = getSavingsPercent(product.price, product.compare_price);
  const tag = product.tags?.includes('bestseller') ? 'bestseller'
    : product.tags?.includes('new') || product.is_new ? 'new'
    : product.tags?.includes('limited') ? 'limited' : null;

  const tagLabel = tag === 'bestseller' ? '🔥 Bestseller'
    : tag === 'new' ? '✦ New'
    : tag === 'limited' ? '⚡ Limited' : '';

  const gradient = 'linear-gradient(135deg, #FAF2D3 0%, #FDF8F0 100%)';

  return (
    <div className="product-card" data-type={product.categories?.slug || product.category_id}>
      <Link href={`/shop/${product.slug}`}>
        <div className="product-img">
          <div className="product-img-bg" style={{ background: gradient, position: 'absolute', inset: 0 }} />
          {tag && <span className={`product-tag tag-${tag}`}>{tagLabel}</span>}
          <div className="product-bottle-wrap">
            <img
              src={product.images?.[0] || '/products/beaded_bracelet.png'}
              alt={product.name}
              style={{ width: '160px', height: '160px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 8px 24px rgba(196, 96, 122, 0.15)' }}
            />
          </div>
          <div className="product-actions">
            <button className={`prod-action-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} title="Wishlist">
              {wishlisted ? '♥' : '♡'}
            </button>
          </div>
        </div>
        <div className="product-info">
          <p className="product-category">{product.categories?.name || product.category_id}</p>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-notes">{product.short_description}</p>
          <div className="product-footer">
            <div className="product-price">
              <span className="price-main">{formatCurrency(product.price)}</span>
              {product.compare_price > product.price && (
                <span className="price-original">{formatCurrency(product.compare_price)}</span>
              )}
            </div>
            <button className="add-to-cart-btn" onClick={handleAddToCart} title="Add to Cart">+</button>
          </div>
        </div>
      </Link>
    </div>
  );
}
