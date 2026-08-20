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
// FALLBACK DATA — used when Supabase is not configured
// ============================================================
export const fallbackProducts = [
  {
    id: '1', name: 'Noir Royale Bracelet', slug: 'noir-royale-bracelet',
    description: 'A masterpiece from the heart of our collection. The Noir Royale Bracelet features hand-selected black crystal beads paired with lustrous gold accents, creating a statement piece that commands attention.',
    short_description: 'Black Crystal Beads · Gold Accents · Chain Clasp',
    price: 2500, compare_price: 3500,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.26 PM.jpeg'],
    materials: 'Black Crystal Beads, 18K Gold-Plated Accents, Stainless Steel Clasp',
    stock: 25, is_featured: true, is_new: false,
    rating: 4.9, review_count: 284, tags: ['bestseller', 'crystal'],
    categories: { name: 'Bracelets', slug: 'bracelets' },
    category_id: 'bracelets'
  },
  {
    id: '2', name: 'Royal Sapphire Bracelet', slug: 'royal-sapphire-bracelet',
    description: 'Inspired by the deep blue of sapphire gemstones, this bracelet combines royal blue beads with delicate gold chain links and a stunning tassel charm.',
    short_description: 'Royal Blue Beads · Gold Chain · Tassel Charm',
    price: 2800, compare_price: 3800,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.29 PM.jpeg'],
    materials: 'Royal Blue Glass Beads, Gold-Plated Chain, Silk Tassel',
    stock: 18, is_featured: true, is_new: true,
    rating: 4.8, review_count: 193, tags: ['new', 'blue'],
    categories: { name: 'Bracelets', slug: 'bracelets' },
    category_id: 'bracelets'
  },
  {
    id: '3', name: 'Blush Crystal Bag', slug: 'blush-crystal-bag',
    description: 'Our most coveted beaded bag, the Blush Crystal is a true work of art. Thousands of hand-threaded pink crystal beads create a mesmerizing mosaic pattern.',
    short_description: 'Pink Crystal Beads · Satin Lined · Top Handle',
    price: 6500, compare_price: 8500,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.33 PM.jpeg'],
    materials: 'Pink Crystal Beads, Satin Lining, Metal Frame, Gold-Plated Handle',
    stock: 8, is_featured: true, is_new: false,
    rating: 5.0, review_count: 147, tags: ['limited', 'pink', 'bag'],
    categories: { name: 'Beaded Bags', slug: 'beaded-bags' },
    category_id: 'beaded-bags'
  },
  {
    id: '4', name: 'Midnight Noir Bag', slug: 'midnight-noir-bag',
    description: 'Sophistication meets artistry in the Midnight Noir Bag. Black faceted beads catch the light with every movement, creating a dynamic shimmer effect.',
    short_description: 'Black Faceted Beads · Gold Chain Strap · Clasp Lock',
    price: 7500, compare_price: 9500,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.48 PM (1).jpeg'],
    materials: 'Black Faceted Crystal Beads, Gold-Plated Chain, Magnetic Clasp',
    stock: 12, is_featured: true, is_new: false,
    rating: 4.7, review_count: 221, tags: ['bestseller', 'black', 'bag'],
    categories: { name: 'Beaded Bags', slug: 'beaded-bags' },
    category_id: 'beaded-bags'
  },
  {
    id: '5', name: 'Ruby Blaze Bracelet', slug: 'ruby-blaze-bracelet',
    description: 'Ignite your style with the Ruby Blaze Bracelet. Vivid red crystal beads are woven together with gold wire to create a bracelet that radiates warmth and confidence.',
    short_description: 'Red Crystal Beads · Gold Wire · Lobster Clasp',
    price: 2200, compare_price: 3000,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.35 PM.jpeg'],
    materials: 'Red Crystal Beads, Gold-Plated Wire, Lobster Clasp',
    stock: 30, is_featured: false, is_new: true,
    rating: 4.6, review_count: 108, tags: ['new', 'red'],
    categories: { name: 'Bracelets', slug: 'bracelets' },
    category_id: 'bracelets'
  },
  {
    id: '6', name: 'Butterfly Dream Bracelet', slug: 'butterfly-dream-bracelet',
    description: 'Delicate and dreamy, the Butterfly Dream Bracelet features smoky crystal beads complemented by an intricately detailed butterfly charm.',
    short_description: 'Smoky Crystal · Butterfly Charm · Stretch Fit',
    price: 1800, compare_price: 2500,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.42 PM (1).jpeg'],
    materials: 'Smoky Quartz Crystal, Alloy Butterfly Charm, Elastic Band',
    stock: 22, is_featured: false, is_new: false,
    rating: 4.5, review_count: 89, tags: ['charm', 'smoky'],
    categories: { name: 'Bracelets', slug: 'bracelets' },
    category_id: 'bracelets'
  },
  {
    id: '7', name: 'Custom Name Tasbih', slug: 'custom-name-tasbih',
    description: 'A deeply personal piece, our Custom Name Tasbih is crafted with black crystal beads and personalized letter beads spelling out your chosen name or word.',
    short_description: 'Black Crystal · Personalized Letters · Silk Tassel',
    price: 3200, compare_price: 4200,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.48 PM (2).jpeg'],
    materials: 'Black Crystal Beads, Acrylic Letter Beads, Silk Tassel',
    stock: 40, is_featured: true, is_new: false,
    rating: 4.9, review_count: 162, tags: ['bestseller', 'custom', 'personalized'],
    is_customizable: true,
    categories: { name: 'Tasbihs', slug: 'tasbihs' },
    category_id: 'tasbihs'
  },
  {
    id: '8', name: 'Teal Charm Bracelet', slug: 'teal-charm-bracelet',
    description: 'Fresh and playful, the Teal Charm Bracelet combines teal agate beads with adorable flower and bow charms.',
    short_description: 'Teal Agate · Flower & Bow Charms · Elastic Band',
    price: 2000, compare_price: 2800,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.47 PM.jpeg'],
    materials: 'Teal Agate Beads, Enamel Charms, Elastic Band',
    stock: 35, is_featured: false, is_new: true,
    rating: 4.4, review_count: 76, tags: ['new', 'teal', 'charm'],
    categories: { name: 'Bracelets', slug: 'bracelets' },
    category_id: 'bracelets'
  },
  {
    id: '9', name: 'Pearl Cascade Necklace', slug: 'pearl-cascade-necklace',
    description: 'Timeless elegance meets modern design in the Pearl Cascade Necklace. Freshwater pearls of varying sizes cascade along a delicate gold chain.',
    short_description: 'Freshwater Pearls · Gold Chain · Adjustable Length',
    price: 4500, compare_price: 5800,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.34 PM (1).jpeg'],
    materials: 'Freshwater Pearls, 18K Gold-Plated Chain, Lobster Clasp',
    stock: 15, is_featured: true, is_new: true,
    rating: 4.8, review_count: 67, tags: ['new', 'pearl', 'necklace'],
    categories: { name: 'Necklaces', slug: 'necklaces' },
    category_id: 'necklaces'
  },
  {
    id: '10', name: 'Rose Quartz Drop Earrings', slug: 'rose-quartz-drop-earrings',
    description: 'Graceful rose quartz beads dangle from gold-plated hooks, catching the light with a soft pink luminescence.',
    short_description: 'Rose Quartz Beads · Gold Hooks · Lightweight',
    price: 1500, compare_price: 2200,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.39 PM (1).jpeg'],
    materials: 'Natural Rose Quartz, 18K Gold-Plated Hooks, Hypoallergenic',
    stock: 28, is_featured: false, is_new: true,
    rating: 4.7, review_count: 54, tags: ['new', 'earrings', 'rose'],
    categories: { name: 'Earrings', slug: 'earrings' },
    category_id: 'earrings'
  },
  {
    id: '11', name: 'Artisan Gift Box — Luxe', slug: 'artisan-gift-box-luxe',
    description: 'The ultimate jewellery gift experience. This curated gift box includes a crystal bracelet, matching earrings, and a beaded pouch.',
    short_description: 'Crystal Bracelet + Earrings + Beaded Pouch',
    price: 8500, compare_price: 11000,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.49 PM (1).jpeg'],
    materials: 'Assorted Crystal Beads, Gold-Plated Accents, Signature Packaging',
    stock: 10, is_featured: true, is_new: false,
    rating: 5.0, review_count: 38, tags: ['gift', 'limited', 'set'],
    categories: { name: 'Gift Sets', slug: 'gift-sets' },
    category_id: 'gift-sets'
  },
  {
    id: '12', name: 'Emerald Vine Bracelet', slug: 'emerald-vine-bracelet',
    description: 'Inspired by lush greenery, the Emerald Vine Bracelet features deep green crystal beads intertwined with gold vine-like links.',
    short_description: 'Emerald Green Crystal · Gold Vine Links · Magnetic Clasp',
    price: 2400, compare_price: 3200,
    images: ['/products/WhatsApp Image 2026-02-27 at 11.12.34 PM.jpeg'],
    materials: 'Green Crystal Beads, Gold-Plated Vine Links, Magnetic Clasp',
    stock: 20, is_featured: false, is_new: false,
    rating: 4.6, review_count: 92, tags: ['green', 'nature'],
    categories: { name: 'Bracelets', slug: 'bracelets' },
    category_id: 'bracelets'
  }
];

export const fallbackCategories = [
  { id: '1', name: 'Bracelets', slug: 'bracelets', description: 'Crystal, charm, beaded & stackable bracelets', sort_order: 1 },
  { id: '2', name: 'Necklaces', slug: 'necklaces', description: 'Elegant beaded necklaces and pearl chokers', sort_order: 2 },
  { id: '3', name: 'Earrings', slug: 'earrings', description: 'Drop, stud, and hoop earrings with beaded detailing', sort_order: 3 },
  { id: '4', name: 'Beaded Bags', slug: 'beaded-bags', description: 'Handcrafted clutch, handbag, crossbody & mini bags', sort_order: 4 },
  { id: '5', name: 'Tasbihs', slug: 'tasbihs', description: 'Custom name, crystal & personalized prayer beads', sort_order: 5 },
  { id: '6', name: 'Gift Sets', slug: 'gift-sets', description: 'Curated jewellery gift boxes for every occasion', sort_order: 6 },
];
