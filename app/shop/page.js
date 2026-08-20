'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getStoredCategories, getStoredProducts } from '@/lib/products';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    setProductsList(getStoredProducts());
    setCategoriesList(getStoredCategories());
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setCategory(cat);
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let products = [...productsList];

    // Category filter
    if (category !== 'all') {
      products = products.filter(p =>
        p.categories?.slug === category || p.category_id === category
      );
    }

    // Search filter
    if (search) {
      const s = search.toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(s) ||
        p.description?.toLowerCase().includes(s) ||
        p.materials?.toLowerCase().includes(s)
      );
    }

    // Price filter
    products = products.filter(p => p.price <= maxPrice);

    // Sort
    switch (sort) {
      case 'price-asc': products.sort((a, b) => a.price - b.price); break;
      case 'price-desc': products.sort((a, b) => b.price - a.price); break;
      case 'rating': products.sort((a, b) => b.rating - a.rating); break;
      case 'name': products.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'bestselling': products.sort((a, b) => b.review_count - a.review_count); break;
      default: break;
    }

    return products;
  }, [productsList, category, sort, search, maxPrice]);

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Shop</span>
          {category !== 'all' && (
            <>
              <span className="breadcrumb-sep">/</span>
              <span style={{ color: 'var(--rose)', textTransform: 'capitalize' }}>
                {categoriesList.find(c => c.slug === category)?.name || category}
              </span>
            </>
          )}
        </div>
        <h1>Our Collection</h1>
        <p>Handcrafted beaded jewellery & pearl art — made with love, worn with pride.</p>
      </div>

      <div className="shop-page">
        <div className="container">
          <div className="shop-layout">
            {/* Sidebar */}
            <aside className="shop-sidebar">
              <div className="sidebar-section">
                <h3 className="sidebar-title">Categories</h3>
                <button className={`sidebar-link ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
                  All Products <span>{productsList.length}</span>
                </button>
                {categoriesList.map(cat => {
                  const count = productsList.filter(p => p.categories?.slug === cat.slug || p.category_id === cat.slug).length;
                  return (
                    <button key={cat.id || cat.slug} className={`sidebar-link ${category === cat.slug ? 'active' : ''}`} onClick={() => setCategory(cat.slug)} style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer' }}>
                      {cat.name} <span>{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-title">Price Range</h3>
                <div className="price-range">
                  <input type="range" min="500" max="15000" step="500" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} />
                  <div className="price-labels"><span>Rs. 500</span><span>Rs. {maxPrice.toLocaleString()}</span></div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div>
              {/* Toolbar */}
              <div className="shop-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <input
                    type="text" placeholder="Search products..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="form-input" style={{ maxWidth: '300px', padding: '10px 16px', fontSize: '13px' }}
                  />
                  <span className="shop-count">{filteredProducts.length} products</span>
                </div>
                <div className="shop-sort">
                  <label>Sort by</label>
                  <select value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="bestselling">Bestselling</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length > 0 ? (
                <div className="products-grid">
                  {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                  <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</p>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '8px' }}>No products found</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Try adjusting your filters or search terms.</p>
                  <button className="btn-outline" onClick={() => { setCategory('all'); setSearch(''); setMaxPrice(15000); }}>Clear Filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="page-header"><h1>Loading Shop...</h1></div>}>
      <ShopContent />
    </Suspense>
  );
}
