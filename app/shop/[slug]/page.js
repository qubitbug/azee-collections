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

  // Customer reviews state
  const [reviewsList, setReviewsList] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    setAllProducts(getStoredProducts());
  }, []);

  const product = useMemo(() => {
    return allProducts.find(p => p.slug === slug);
  }, [allProducts, slug]);

  useEffect(() => {
    if (!product) return;
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem(`azee_reviews_${product.id}`) || 'null');
      if (saved) {
        setReviewsList(saved);
      } else {
        setReviewsList([
          { id: 1, name: 'Saba Karim', rating: 5, date: '2 days ago', comment: 'Exquisite craftsmanship! The beaded work is so delicate and durable.' },
          { id: 2, name: 'Fatima Z.', rating: 5, date: '1 week ago', comment: 'Loved the custom name Tasbih! Received so many compliments.' }
        ]);
      }
    }
  }, [product]);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      showToast('Please enter your name and review');
      return;
    }

    const reviewObj = {
      id: Date.now(),
      name: newReview.name,
      rating: Number(newReview.rating),
      comment: newReview.comment,
      date: 'Just now',
    };

    const updated = [reviewObj, ...reviewsList];
    setReviewsList(updated);

    if (typeof window !== 'undefined' && product) {
      localStorage.setItem(`azee_reviews_${product.id}`, JSON.stringify(updated));
    }

    showToast('Thank you for your review! ⭐');
    setNewReview({ name: '', rating: 5, comment: '' });
  };

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
  const images = product.images?.length > 0 ? product.images : ['/products/beaded_bracelet.png'];

  const handleAddToCart = () => {
    addItem(product, quantity, customizationText);
    showToast(`Added "${product.name}" to cart! 🛍️`);
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb" style={{ marginBottom: '24px' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/shop">Shop</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Gallery */}
          <div className="detail-gallery">
            <div className="main-image-container">
              <img
                src={images[mainImage] || images[0]}
                alt={product.name}
                className="main-image"
              />
              {savings > 0 && <span className="discount-badge">-{savings}% OFF</span>}
              <button
                className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Add to wishlist"
                style={{ top: '16px', right: '16px' }}
              >
                ♥
              </button>
            </div>
            {images.length > 1 && (
              <div className="thumbnail-grid">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumb-btn ${mainImage === index ? 'active' : ''}`}
                    onClick={() => setMainImage(index)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <span className="detail-category">
              {product.categories?.name || product.categories?.slug || 'Handcrafted Collection'}
            </span>
            <h1 className="detail-title">{product.name}</h1>

            <div className="detail-price" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <span className="detail-price-main" style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--rose-deep)', fontWeight: 600 }}>{formatCurrency(product.price)}</span>
              {product.compare_price > product.price && (
                <span className="detail-price-original" style={{ fontSize: '16px', color: 'var(--text-light)', textDecoration: 'line-through' }}>{formatCurrency(product.compare_price)}</span>
              )}
              {savings > 0 && (
                <span className="detail-price-save" style={{ background: 'rgba(196,96,122,0.1)', color: 'var(--rose)', fontSize: '12px', padding: '4px 12px', borderRadius: '20px', fontWeight: 600 }}>
                  {savings}% OFF
                </span>
              )}
            </div>

            <p className="detail-short-desc">{product.short_description || product.description}</p>

            {/* Customization Text Field (If product is customizable) */}
            {product.is_customizable && (
              <div className="customization-box" style={{
                background: 'var(--bg-blush)',
                border: '1.5px solid var(--pink-soft)',
                borderRadius: '16px',
                padding: '18px',
                marginBottom: '24px'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: 'var(--rose-dark)',
                  marginBottom: '8px'
                }}>
                  <span>✨ Personalize / Custom Request</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter name, word, or custom detail (e.g. 'Ayesha', 'Gold Beads')"
                  value={customizationText}
                  onChange={(e) => setCustomizationText(e.target.value)}
                  className="form-input"
                  style={{
                    background: 'var(--bg-card)',
                    borderColor: 'var(--border-dark)',
                    fontSize: '13px'
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  This product is customizable! Type your text above and it will be included with your order.
                </span>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>Quantity</label>
              <div className="quantity-selector" style={{ width: 'fit-content' }}>
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginBottom: '24px' }}>
              <button className="btn-primary btn-block" onClick={handleAddToCart} style={{ justifyContent: 'center', width: '100%', padding: '16px 24px', fontSize: '15px' }}>
                <span>Add to Cart</span>
              </button>
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
            <div className="detail-tabs" style={{ marginTop: '32px' }}>
              <div className="tab-buttons">
                {['description', 'materials', 'shipping', 'reviews'].map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                    {tab === 'materials' ? 'Materials & Care' : tab === 'reviews' ? `Reviews (${reviewsList.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                      <li>Nationwide delivery across Pakistan</li>
                    </ul>
                    <br />
                    <p><strong>Returns:</strong></p>
                    <p>We accept returns within 30 days of delivery. Items must be unworn and in original packaging.</p>
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div>
                    <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '16px' }}>Customer Reviews ({reviewsList.length})</h4>
                    
                    {/* Add Review Form */}
                    <form onSubmit={handleAddReview} style={{ background: 'var(--bg-blush)', padding: '20px', borderRadius: '16px', marginBottom: '24px', border: '1px solid var(--border-dark)' }}>
                      <h5 style={{ fontWeight: 600, marginBottom: '12px' }}>Leave a Customer Review</h5>
                      <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          required
                          placeholder="Your Name *"
                          className="form-input"
                          value={newReview.name}
                          onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        />
                        <select
                          className="form-input"
                          value={newReview.rating}
                          onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        >
                          <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                          <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                          <option value={3}>⭐⭐⭐ (3/5)</option>
                          <option value={2}>⭐⭐ (2/5)</option>
                          <option value={1}>⭐ (1/5)</option>
                        </select>
                      </div>
                      <textarea
                        rows="3"
                        required
                        placeholder="Write your review experience..."
                        className="form-input"
                        style={{ marginBottom: '12px' }}
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      ></textarea>
                      <button type="submit" className="btn-primary btn-sm">
                        <span>Submit Review</span>
                      </button>
                    </form>

                    {/* Reviews List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {reviewsList.map(r => (
                        <div key={r.id} style={{ padding: '16px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-dark)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>{r.name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.date}</span>
                          </div>
                          <div style={{ color: '#E5A65E', fontSize: '14px', marginBottom: '6px' }}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </div>
                          <p style={{ fontSize: '13px', color: 'var(--text-body)', margin: 0 }}>{r.comment}</p>
                        </div>
                      ))}
                    </div>
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
