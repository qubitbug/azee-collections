'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredCategories, getStoredProducts } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { showToast } from '@/components/Toast';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'add-product' | 'add-category' | 'orders'
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  // New product state (Google Drive link storage supported)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'bracelets',
    price: '',
    comparePrice: '',
    shortDescription: '',
    description: '',
    imageUrl: '', // Supports Google Drive direct image links or standard image URLs
    materials: '',
    stock: 20,
    isCustomizable: false,
  });

  // New category state
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    setProductsList(getStoredProducts());
    setCategoriesList(getStoredCategories());
    if (typeof window !== 'undefined') {
      const savedOrders = JSON.parse(localStorage.getItem('azee_past_orders') || '[]');
      setOrdersList(savedOrders);
    }
  }, []);

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('Please fill in product name and price');
      return;
    }

    const categoryObj = categoriesList.find(c => c.slug === newProduct.category) || { name: newProduct.category.toUpperCase(), slug: newProduct.category };

    const created = {
      id: Date.now().toString(),
      name: newProduct.name,
      slug: newProduct.name.toLowerCase().replace(/\s+/g, '-'),
      description: newProduct.description || newProduct.shortDescription,
      short_description: newProduct.shortDescription || 'Handcrafted beaded jewellery piece',
      price: Number(newProduct.price),
      compare_price: newProduct.comparePrice ? Number(newProduct.comparePrice) : null,
      images: [newProduct.imageUrl || '/products/beaded_bracelet.png'],
      materials: newProduct.materials || 'Beads, Gold-plated components',
      stock: Number(newProduct.stock),
      is_featured: true,
      is_new: true,
      rating: 5.0,
      review_count: 1,
      tags: ['new'],
      is_customizable: newProduct.isCustomizable,
      categories: categoryObj,
      category_id: newProduct.category,
    };

    const updatedProds = [created, ...productsList];
    setProductsList(updatedProds);

    if (typeof window !== 'undefined') {
      const customProds = JSON.parse(localStorage.getItem('azee_custom_products') || '[]');
      localStorage.setItem('azee_custom_products', JSON.stringify([created, ...customProds]));
    }

    // Sync to Supabase Cloud
    supabase.from('products').insert([{
      name: created.name,
      slug: created.slug,
      description: created.description,
      short_description: created.short_description,
      price: created.price,
      compare_price: created.compare_price,
      images: created.images,
      materials: created.materials,
      stock: created.stock,
      is_customizable: created.is_customizable,
    }]).then(({ error }) => {
      if (error) console.log('Supabase product insert note:', error.message);
    });

    showToast('New product added to store! ✨');
    setActiveTab('products');
    setNewProduct({
      name: '',
      category: categoriesList[0]?.slug || 'bracelets',
      price: '',
      comparePrice: '',
      shortDescription: '',
      description: '',
      imageUrl: '',
      materials: '',
      stock: 20,
      isCustomizable: false,
    });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.name) {
      showToast('Please enter category name');
      return;
    }

    const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const createdCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      slug,
      description: newCategory.description || 'Handcrafted artisan category',
      image_url: newCategory.imageUrl || '',
      sort_order: categoriesList.length + 1,
    };

    const updatedCats = [...categoriesList, createdCategory];
    setCategoriesList(updatedCats);

    if (typeof window !== 'undefined') {
      const customCats = JSON.parse(localStorage.getItem('azee_custom_categories') || '[]');
      localStorage.setItem('azee_custom_categories', JSON.stringify([...customCats, createdCategory]));
    }

    // Sync to Supabase Cloud
    supabase.from('categories').insert([{
      name: createdCategory.name,
      slug: createdCategory.slug,
      description: createdCategory.description,
      image_url: createdCategory.image_url,
    }]).then(({ error }) => {
      if (error) console.log('Supabase category insert note:', error.message);
    });

    showToast(`Category "${newCategory.name}" added successfully! 🏷️`);
    setActiveTab('products');
    setNewCategory({ name: '', slug: '', description: '', imageUrl: '' });
  };

  const handleStatusChange = (orderIndex, newStatus) => {
    const updated = [...ordersList];
    updated[orderIndex].status = newStatus;
    setOrdersList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('azee_past_orders', JSON.stringify(updated));
    }
    showToast(`Order status updated to ${newStatus}`);
  };

  const totalRevenue = ordersList.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  return (
    <>
      <div className="page-header" style={{ padding: '100px 0 40px', background: 'var(--bg-deep)', color: 'var(--text-on-dark)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--rose-light)' }}>
                ADMIN CONTROL CENTER
              </span>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--text-on-dark)', marginTop: '4px' }}>
                Store Management
              </h1>
            </div>
            <Link href="/" className="btn-ghost" style={{ borderColor: 'rgba(196,96,122,0.4)', color: 'var(--text-on-dark)' }}>
              ← Exit to Storefront
            </Link>
          </div>
        </div>
      </div>

      <div className="shop-page" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          {/* Stats Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Sales Revenue</div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', color: 'var(--rose)', marginTop: '4px' }}>
                {formatCurrency(totalRevenue)}
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Orders</div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginTop: '4px' }}>
                {ordersList.length}
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Categories</div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginTop: '4px' }}>
                {categoriesList.length} Categories
              </div>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Catalogue</div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)', marginTop: '4px' }}>
                {productsList.length} Items
              </div>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="filter-tabs" style={{ justifyContent: 'flex-start', marginBottom: '24px' }}>
            <button className={`filter-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              Products Catalogue ({productsList.length})
            </button>
            <button className={`filter-btn ${activeTab === 'add-product' ? 'active' : ''}`} onClick={() => setActiveTab('add-product')}>
              + Add New Product
            </button>
            <button className={`filter-btn ${activeTab === 'add-category' ? 'active' : ''}`} onClick={() => setActiveTab('add-category')}>
              🏷️ + Add Category
            </button>
            <button className={`filter-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              Customer Orders ({ordersList.length})
            </button>
          </div>

          {/* TAB 1: PRODUCTS LIST */}
          {activeTab === 'products' && (
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-dark)', padding: '24px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>Product Inventory</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button className="btn-primary btn-sm" onClick={() => setActiveTab('add-product')}>
                    <span>+ Add Product</span>
                  </button>
                  <button className="btn-outline btn-sm" onClick={() => setActiveTab('add-category')}>
                    + Add Category
                  </button>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-dark)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Product</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Price</th>
                    <th style={{ padding: '12px' }}>Stock</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-dark)' }}>
                      <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.images?.[0]} alt={p.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                        <span style={{ fontWeight: 500 }}>{p.name}</span>
                      </td>
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{p.categories?.name || p.categories?.slug || p.category_id}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--rose)' }}>{formatCurrency(p.price)}</td>
                      <td style={{ padding: '12px' }}>{p.stock} units</td>
                      <td style={{ padding: '12px' }}>
                        <Link href={`/shop/${p.slug}`} target="_blank" style={{ fontSize: '12px', color: 'var(--rose)', textDecoration: 'underline' }}>
                          View Live ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: ADD NEW PRODUCT FORM */}
          {activeTab === 'add-product' && (
            <div className="auth-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '20px' }}>Add Product to Catalogue</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Enter product details below. Image URL supports Google Drive direct links or external image links.
              </p>

              <form onSubmit={handleAddProduct}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal Pearl Choker"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="form-input"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat.id || cat.slug} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (PKR Rs.) *</label>
                    <input
                      type="number"
                      required
                      placeholder="3500"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Original/Compare Price (Optional)</label>
                    <input
                      type="number"
                      placeholder="4500"
                      value={newProduct.comparePrice}
                      onChange={(e) => setNewProduct({ ...newProduct, comparePrice: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ background: 'var(--bg-blush)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-dark)', marginBottom: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={newProduct.isCustomizable}
                      onChange={(e) => setNewProduct({ ...newProduct, isCustomizable: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--rose)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                        ✨ Allow Product Customization
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Enable this so customers can enter custom names/words (e.g. for custom tasbihs or engraved bracelets).
                      </div>
                    </div>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL / Google Drive Shareable Image Link</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/... or https://..."
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    className="form-input"
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Tip: Store images on Google Drive to save hosting storage space.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Materials & Craftsmanship</label>
                  <input
                    type="text"
                    placeholder="e.g. Freshwater pearls, 18K gold-plated chain, Japanese seed beads"
                    value={newProduct.materials}
                    onChange={(e) => setNewProduct({ ...newProduct, materials: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <input
                    type="text"
                    placeholder="Brief tagline for product card"
                    value={newProduct.shortDescription}
                    onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Full Description</label>
                  <textarea
                    rows="4"
                    placeholder="Detailed craftsmanship story..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="form-input"
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary btn-block">
                  <span>Publish Product</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: ADD NEW CATEGORY FORM */}
          {activeTab === 'add-category' && (
            <div className="auth-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '12px' }}>🏷️ Add New Category</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Create a new category to organize your jewellery and artwork pieces (e.g. Anklets, Headpieces, Rings).
              </p>

              <form onSubmit={handleAddCategory}>
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anklets & Footwear Art"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category URL Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. anklets (Auto-generated if left blank)"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Image / Banner URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/... or https://..."
                    value={newCategory.imageUrl}
                    onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category Description</label>
                  <textarea
                    rows="3"
                    placeholder="Brief overview of this category..."
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="form-input"
                  ></textarea>
                </div>

                <button type="submit" className="btn-primary btn-block">
                  <span>Create Category</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ORDERS LIST */}
          {activeTab === 'orders' && (
            <div>
              {ordersList.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                  No customer orders received yet.
                </div>
              ) : (
                ordersList.map((order, idx) => (
                  <div key={idx} className="order-card" style={{ marginBottom: '20px' }}>
                    <div className="order-header">
                      <div>
                        <div className="order-number">Order #{order.orderNumber}</div>
                        <div className="order-date">
                          Customer: <strong>{order.customer?.fullName}</strong> ({order.customer?.phone}, {order.customer?.city})
                        </div>
                      </div>
                      <select
                        value={order.status || 'processing'}
                        onChange={(e) => handleStatusChange(idx, e.target.value)}
                        style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: '1px solid var(--border)' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div style={{ fontSize: '13px', margin: '12px 0' }}>
                      <strong>Payment Method:</strong> {order.paymentMethod?.toUpperCase()} | <strong>Total:</strong> {formatCurrency(order.pricing?.total)}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
