'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStoredCategories, getStoredProducts } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { formatCurrency, convertGoogleDriveUrl } from '@/lib/utils';
import { showToast } from '@/components/Toast';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'add-product' | 'add-category' | 'orders'
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);

  // Full Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    name: '',
    category: 'bracelets',
    price: '',
    comparePrice: '',
    shortDescription: '',
    description: '',
    imageUrl: '',
    materials: '',
    stock: 20,
    isCustomizable: false,
  });

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

  const formatCategoryDisplay = (product) => {
    if (product.categories?.name) return product.categories.name;
    if (product.categories?.slug) return product.categories.slug;
    
    const matched = categoriesList.find(c => c.id === product.category_id || c.slug === product.category_id);
    if (matched) return matched.name;

    if (product.category_id && (product.category_id.includes('-') || product.category_id.length > 20)) {
      const lowerName = (product.name || '').toLowerCase();
      if (lowerName.includes('bag')) return 'Handbags';
      if (lowerName.includes('necklace')) return 'Necklaces';
      if (lowerName.includes('earring')) return 'Earrings';
      if (lowerName.includes('ring')) return 'Rings';
      if (lowerName.includes('tasbih')) return 'Tasbihs';
      return 'Bracelets';
    }
    return product.category_id || 'Bracelets';
  };

  const fetchProductsFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*, categories(id, name, slug)');
      if (data && data.length > 0) {
        setProductsList(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('azee_custom_products', JSON.stringify(data));
        }
      } else {
        setProductsList(getStoredProducts());
      }
    } catch {
      setProductsList(getStoredProducts());
    }
  };

  useEffect(() => {
    fetchProductsFromSupabase();
    setCategoriesList(getStoredCategories());
    if (typeof window !== 'undefined') {
      const savedOrders = JSON.parse(localStorage.getItem('azee_past_orders') || '[]');
      setOrdersList(savedOrders);
    }
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('Please fill in product name and price');
      return;
    }

    const categoryObj = categoriesList.find(c => c.slug === newProduct.category) || { name: newProduct.category.toUpperCase(), slug: newProduct.category };
    const convertedImageUrl = convertGoogleDriveUrl(newProduct.imageUrl) || '/products/beaded_bracelet.png';

    const baseSlug = newProduct.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const createdSlug = baseSlug + '-' + Date.now().toString().slice(-4);

    const created = {
      name: newProduct.name,
      slug: createdSlug,
      description: newProduct.description || newProduct.shortDescription || 'Handcrafted jewellery piece',
      short_description: newProduct.shortDescription || 'Handcrafted beaded jewellery piece',
      price: Number(newProduct.price),
      compare_price: newProduct.comparePrice ? Number(newProduct.comparePrice) : null,
      images: [convertedImageUrl],
      materials: newProduct.materials || 'Beads, Gold-plated components',
      stock: Number(newProduct.stock),
      is_featured: true,
      is_new: true,
      is_active: true,
      rating: 5.0,
      review_count: 1,
      tags: ['new'],
      is_customizable: newProduct.isCustomizable,
      categories: categoryObj,
      category_id: newProduct.category,
    };

    // Clean payload matching exact Supabase database table schema
    const dbPayload = {
      name: created.name,
      slug: created.slug,
      description: created.description,
      short_description: created.short_description,
      price: created.price,
      compare_price: created.compare_price,
      images: created.images,
      materials: created.materials,
      stock: created.stock,
      is_featured: true,
      is_new: true,
      is_active: true,
    };

    const { data, error } = await supabase.from('products').insert([dbPayload]).select();

    if (error) {
      console.error('Supabase product insert error:', error);
      showToast('Database sync note: ' + error.message);
    } else if (data && data[0]) {
      showToast('New product saved to database! ✨');
      await fetchProductsFromSupabase();
    } else {
      showToast('New product added to catalogue! ✨');
      await fetchProductsFromSupabase();
    }

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

  const handleOpenEditProduct = (product) => {
    setEditingProduct(product);
    setEditProductForm({
      name: product.name || '',
      category: product.categories?.slug || product.category_id || 'bracelets',
      price: product.price ? String(product.price) : '',
      comparePrice: product.compare_price ? String(product.compare_price) : '',
      shortDescription: product.short_description || '',
      description: product.description || '',
      imageUrl: product.images?.[0] || '',
      materials: product.materials || '',
      stock: product.stock !== undefined ? Number(product.stock) : 20,
      isCustomizable: Boolean(product.is_customizable),
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct || !editProductForm.name || !editProductForm.price) {
      showToast('Please fill in product name and price');
      return;
    }

    const convertedImageUrl = convertGoogleDriveUrl(editProductForm.imageUrl) || editProductForm.imageUrl || '/products/beaded_bracelet.png';

    const dbUpdatePayload = {
      name: editProductForm.name,
      price: Number(editProductForm.price),
      compare_price: editProductForm.comparePrice ? Number(editProductForm.comparePrice) : null,
      images: [convertedImageUrl],
      materials: editProductForm.materials || 'Beads, Gold-plated components',
      stock: Number(editProductForm.stock),
      short_description: editProductForm.shortDescription,
      description: editProductForm.description || editProductForm.shortDescription,
    };

    const { error } = await supabase
      .from('products')
      .update(dbUpdatePayload)
      .or(`id.eq.${editingProduct.id},slug.eq.${editingProduct.slug}`);

    if (error) {
      console.error('Supabase update product error:', error);
      showToast('Database update note: ' + error.message);
    } else {
      showToast(`Updated "${editProductForm.name}" in database! ✏️`);
      await fetchProductsFromSupabase();
    }

    setEditingProduct(null);
  };

  const handleDeleteProduct = async (product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .or(`id.eq.${product.id},slug.eq.${product.slug}`);

    if (error) {
      console.error('Supabase delete error:', error);
      showToast('Database delete note: ' + error.message);
    } else {
      showToast(`Deleted "${product.name}" from database.`);
      await fetchProductsFromSupabase();
    }
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
                      <td style={{ padding: '12px', textTransform: 'capitalize' }}>{formatCategoryDisplay(p)}</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: 'var(--rose)' }}>{formatCurrency(p.price)}</td>
                      <td style={{ padding: '12px' }}>{p.stock} units</td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Link href={`/shop/${p.slug}`} target="_blank" style={{ fontSize: '12px', color: 'var(--rose)', textDecoration: 'underline' }}>
                            View Live ↗
                          </Link>
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            style={{
                              padding: '4px 12px', fontSize: '11px', borderRadius: '20px',
                              background: 'rgba(201,169,110,0.18)', color: '#8b6914',
                              border: '1px solid rgba(201,169,110,0.4)', cursor: 'pointer', fontWeight: 600
                            }}
                          >
                            ✏️ Edit Product
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p)}
                            style={{
                              padding: '4px 10px', fontSize: '11px', borderRadius: '20px',
                              background: 'rgba(217,83,79,0.15)', color: '#d9534f',
                              border: '1px solid rgba(217,83,79,0.3)', cursor: 'pointer', fontWeight: 600
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Full Edit Product Modal */}
              {editingProduct && (
                <div style={{
                  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
                }}>
                  <div style={{
                    background: 'var(--bg-card)', borderRadius: '20px', padding: '32px',
                    width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
                    border: '1px solid var(--border-dark)', boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px' }}>✏️ Edit Product: {editingProduct.name}</h4>
                      <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
                    </div>

                    <form onSubmit={handleSaveProduct}>
                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Product Name *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={editProductForm.name}
                          onChange={(e) => setEditProductForm({ ...editProductForm, name: e.target.value })}
                        />
                      </div>

                      <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">Category *</label>
                          <select
                            className="form-input"
                            value={editProductForm.category}
                            onChange={(e) => setEditProductForm({ ...editProductForm, category: e.target.value })}
                          >
                            {categoriesList.map(c => (
                              <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Price (Rs.) *</label>
                          <input
                            type="number"
                            required
                            className="form-input"
                            value={editProductForm.price}
                            onChange={(e) => setEditProductForm({ ...editProductForm, price: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Compare Price (Rs.)</label>
                          <input
                            type="number"
                            className="form-input"
                            value={editProductForm.comparePrice}
                            onChange={(e) => setEditProductForm({ ...editProductForm, comparePrice: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div className="form-group">
                          <label className="form-label">Stock Units</label>
                          <input
                            type="number"
                            className="form-input"
                            value={editProductForm.stock}
                            onChange={(e) => setEditProductForm({ ...editProductForm, stock: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            <input
                              type="checkbox"
                              checked={editProductForm.isCustomizable}
                              onChange={(e) => setEditProductForm({ ...editProductForm, isCustomizable: e.target.checked })}
                              style={{ width: '18px', height: '18px', accentColor: 'var(--rose)' }}
                            />
                            <span>✨ Allow Customization</span>
                          </label>
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Image URL / Google Drive Link</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editProductForm.imageUrl}
                          onChange={(e) => setEditProductForm({ ...editProductForm, imageUrl: e.target.value })}
                          placeholder="https://drive.google.com/..."
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Materials & Craftsmanship</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editProductForm.materials}
                          onChange={(e) => setEditProductForm({ ...editProductForm, materials: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label">Short Tagline</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editProductForm.shortDescription}
                          onChange={(e) => setEditProductForm({ ...editProductForm, shortDescription: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label">Full Description</label>
                        <textarea
                          rows="3"
                          className="form-input"
                          value={editProductForm.description}
                          onChange={(e) => setEditProductForm({ ...editProductForm, description: e.target.value })}
                        ></textarea>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <button type="button" className="btn-ghost" onClick={() => setEditingProduct(null)}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                          <span>Save Product Changes</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
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
