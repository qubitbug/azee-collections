import { supabase } from './supabase';

/**
 * Helper to get categories (merged with client-side localStorage additions)
 */
export function getStoredCategories() {
  if (typeof window === 'undefined') return fallbackCategories;
  try {
    const custom = JSON.parse(localStorage.getItem('azee_custom_categories') || '[]');
    // Avoid duplicate slugs
    const existingSlugs = new Set(fallbackCategories.map(c => c.slug));
    const uniqueCustom = custom.filter(c => !existingSlugs.has(c.slug));
    return [...fallbackCategories, ...uniqueCustom];
  } catch {
    return fallbackCategories;
  }
}

/**
 * Helper to get products (merged with client-side localStorage additions)
 */
export function getStoredProducts() {
  if (typeof window === 'undefined') return fallbackProducts;
  try {
    const custom = JSON.parse(localStorage.getItem('azee_custom_products') || '[]');
    const existingIds = new Set(fallbackProducts.map(p => p.id));
    const uniqueCustom = custom.filter(p => !existingIds.has(p.id));
    return [...fallbackProducts, ...uniqueCustom];
  } catch {
    return fallbackProducts;
  }
}

/**
 * Fetch all products with optional filters
 */
export async function getProducts({
  category = null,
  search = null,
  sort = 'newest',
  minPrice = null,
  maxPrice = null,
  tags = [],
  limit = 20,
  offset = 0,
  featured = null,
  isNew = null,
} = {}) {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug)', { count: 'exact' })
    .eq('is_active', true);

  if (category) {
    query = query.eq('categories.slug', category);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,materials.ilike.%${search}%`);
  }

  if (minPrice !== null) {
    query = query.gte('price', minPrice);
  }

  if (maxPrice !== null) {
    query = query.lte('price', maxPrice);
  }

  if (featured !== null) {
    query = query.eq('is_featured', featured);
  }

  if (isNew !== null) {
    query = query.eq('is_new', isNew);
  }

  if (tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'bestselling':
      query = query.order('review_count', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], total: 0 };
  }

  return { products: data || [], total: count || 0 };
}

/**
 * Fetch a single product by slug
 */
export async function getProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }

  return data;
}

/**
 * Fetch product variants
 */
export async function getProductVariants(productId) {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('variant_type')
    .order('variant_value');

  if (error) {
    console.error('Error fetching variants:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch product reviews
 */
export async function getProductReviews(productId, limit = 10) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name)')
    .eq('product_id', productId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch related products (same category, excluding current)
 */
export async function getRelatedProducts(productId, categoryId, limit = 4) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('category_id', categoryId)
    .neq('id', productId)
    .eq('is_active', true)
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch all categories
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch featured products
 */
export async function getFeaturedProducts(limit = 8) {
  return getProducts({ featured: true, limit, sort: 'bestselling' });
}

/**
 * Fetch new arrivals
 */
export async function getNewArrivals(limit = 4) {
  return getProducts({ isNew: true, limit, sort: 'newest' });
}

// ============================================================
// FALLBACK DATA — empty so store relies 100% on live Supabase Database
// ============================================================
export const fallbackProducts = [];

export const fallbackCategories = [
  { id: '1', name: 'Bracelets', slug: 'bracelets', description: 'Crystal, charm, beaded & stackable bracelets', sort_order: 1 },
  { id: '2', name: 'Necklaces', slug: 'necklaces', description: 'Elegant beaded necklaces and pearl chokers', sort_order: 2 },
  { id: '3', name: 'Earrings', slug: 'earrings', description: 'Drop, stud, and hoop earrings with beaded detailing', sort_order: 3 },
  { id: '4', name: 'Beaded Bags', slug: 'beaded-bags', description: 'Handcrafted clutch, handbag, crossbody & mini bags', sort_order: 4 },
  { id: '5', name: 'Tasbihs', slug: 'tasbihs', description: 'Custom name, crystal & personalized prayer beads', sort_order: 5 },
  { id: '6', name: 'Gift Sets', slug: 'gift-sets', description: 'Curated jewellery gift boxes for every occasion', sort_order: 6 },
];
