'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getStoredProducts } from '@/lib/products';
import { formatCurrency, getSavingsPercent, getWhatsAppSingleProductUrl } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import { showToast } from '@/components/Toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [customizationText, setCustomizationText] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    setAllProducts(getStoredProducts());
  }, []);

  const product = useMemo(() => {
    return allProducts.find(p => p.slug === slug);
  }, [allProducts, slug]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => (p.categories?.slug === product.categories?.slug || p.category_id === product.category_id) && p.id !== product.id)
      .slice(0, 4);
  }, [allProducts, product]);

  if (!product) {
    return (
      <div className="not-found">
        <h1>404</h1>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link href="/shop" className="btn-primary"><span>Browse Collection</span></Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const savings = getSavingsPercent(product.price, product.compare_price);

  const handleAddToCart = () => {
    if (product.is_customizable && !customizationText.trim()) {
      showToast('Please enter your customization request below!');
      return;
    }
    addItem(product, quantity, null, customizationText);
    showToast(`${product.name} added to cart! 🛒`);
  };

  const handleBuyNow = () => {
    if (product.is_customizable && !customizationText.trim()) {
      showToast('Please enter your customization request below!');
      return;
    }
    addItem(product, quantity, null, customizationText);
    window.location.href = '/checkout';
  };

  const handleWishlist = async () => {
    const added = await toggleWishlist(product.id);
    showToast(added ? 'Added to wishlist ♡' : 'Removed from wishlist');
  };

  const stockMessage = (product.stock || 20) <= 5
    ? <span style={{ color: 'var(--warning)', fontSize: '13px', fontWeight: 500 }}>⚡ Only {product.stock} left in stock!</span>
    : <span style={{ color: 'var(--success)', fontSize: '13px' }}>✓ In Stock</span>;

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/shop">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/shop?category=${product.categories?.slug || product.category_id}`}>
            {product.categories?.name || product.category_id}
          </Link>
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: 'var(--rose)' }}>{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="gallery-main">
              <img src={product.images?.[mainImage] || product.images?.[0] || '/products/beaded_bracelet.png'} alt={product.name} />
            </div>
            {product.images?.length > 1 && (
              <div className="gallery-thumbs">
                {product.images.map((img, i) => (
                  <button key={i} className={`gallery-thumb ${mainImage === i ? 'active' : ''}`} onClick={() => setMainImage(i)}>
                    <img src={img} alt={`${product.name} view ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-detail-info">
            <p className="detail-category">{product.categories?.name || product.category_id}</p>
            <h1 className="detail-name">{product.name}</h1>

            <div className="detail-price" style={{ marginTop: '12px' }}>
              <span className="detail-price-main">{formatCurrency(product.price)}</span>
              {product.compare_price > product.price && (
                <>
                  <span className="detail-price-original">{formatCurrency(product.compare_price)}</span>
                  <span className="detail-price-save">Save {savings}%</span>
                </>
              )}
            </div>

            {stockMessage}

            <p className="detail-desc" style={{ marginTop: '16px' }}>{product.description}</p>

            <div className="detail-materials">
              <h4>Materials & Details</h4>
              <p>{product.materials}</p>
            </div>

            {product.is_customizable && (
              <div style={{ margin: '20px 0', padding: '16px', background: 'var(--bg-blush)', borderRadius: '12px', border: '1px solid var(--border-dark)' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ✨ Personalization Request *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Type custom name or word (e.g. Ayesha, Fatima)"
                  value={customizationText}
                  onChange={(e) => setCustomizationText(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '13px', padding: '10px 14px', background: 'var(--bg-card)' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Our artisans will handcraft your specified text/name into this piece.
                </span>
              </div>
            )}

            <div className="detail-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}>+</button>
              </div>

              <button className="btn-primary" onClick={handleAddToCart} style={{ flex: 1 }}>
                <span>Add to Cart — {formatCurrency(product.price * quantity)}</span>
              </button>

              <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist}>
                {wishlisted ? '♥' : '♡'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <button className="btn-ghost btn-block" onClick={handleBuyNow} style={{ justifyContent: 'center' }}>
                Buy Now
              </button>
              <a
                href={getWhatsAppSingleProductUrl(product, quantity, customizationText)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp btn-block"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '14px 16px',
                  background: '#25D366', color: 'white',
                  borderRadius: '40px', fontWeight: 600, fontSize: '13px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)'
                }}
              >
                <span>💬 WhatsApp Order</span>
              </a>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '24px', padding: '20px 0', borderTop: '1px solid var(--border-dark)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '16px' }}>🚚</span> Free shipping over Rs. 5,000
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '16px' }}>🔄</span> 30-day returns
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '16px' }}>🔒</span> Secure payment
              </div>
            </div>

            {/* Tabs */}
            <div className="detail-tabs">
              <div className="tab-buttons">
                {['description', 'materials', 'shipping'].map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab === 'materials' ? 'Materials & Care' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="tab-content">
                {activeTab === 'description' && <p>{product.description}</p>}
                {activeTab === 'materials' && (
                  <div>
                    <p><strong>Materials:</strong> {product.materials}</p>
                    <br />
                    <p><strong>Care Instructions:</strong></p>
                    <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
                      <li>Store in the provided pouch when not wearing</li>
                      <li>Avoid contact with water, perfume, and chemicals</li>
                      <li>Gently wipe with a soft cloth to maintain shine</li>
                      <li>Handle with care to preserve bead integrity</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div>
                    <p><strong>Shipping:</strong></p>
                    <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
                      <li>Free standard shipping on orders over Rs. 5,000</li>
                      <li>Standard shipping (3-5 business days): Rs. 200</li>
                      <li>Express shipping (1-2 business days): Rs. 500</li>
                      <li>Nationwide delivery across Pakistan</li>
                    </ul>
                    <br />
                    <p><strong>Returns:</strong></p>
                    <p>We accept returns within 30 days of delivery. Items must be unworn and in original packaging.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '80px' }}>
            <div className="section-header">
              <p className="section-eyebrow">✦ You May Also Like</p>
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="products-grid">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
