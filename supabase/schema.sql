-- ============================================================
-- AZEE COLLECTIONS — E-Commerce Database Schema
-- Supabase (PostgreSQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'PK',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  images TEXT[] DEFAULT '{}',
  materials TEXT,
  care_instructions TEXT,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCT VARIANTS (size, color, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_type TEXT NOT NULL, -- 'size', 'color', 'material'
  variant_value TEXT NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  -- Shipping Address
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  shipping_method TEXT,
  -- Payment
  payment_intent_id TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
  -- Tracking
  tracking_number TEXT,
  tracking_url TEXT,
  -- Notes
  customer_note TEXT,
  admin_note TEXT,
  -- Coupon
  coupon_code TEXT,
  -- Timestamps
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  variant_info TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  author_name TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Profiles: users can only read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Products: everyone can read, only admin can write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = TRUE);

-- Categories: everyone can read
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (TRUE);

-- Orders: users can only view their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Order Items: users can view items from their orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- Reviews: anyone can read approved reviews, users can write their own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Wishlist: users can only manage their own wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to wishlist" ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from wishlist" ON wishlist FOR DELETE USING (auth.uid() = user_id);

-- Newsletter: anyone can subscribe
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);

-- Product variants: anyone can read
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view variants" ON product_variants FOR SELECT USING (TRUE);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist(user_id);

-- ============================================================
-- SEED DATA: Categories
-- ============================================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Bracelets', 'bracelets', 'Crystal, charm, beaded & stackable bracelets handcrafted with premium beads', 1),
  ('Necklaces', 'necklaces', 'Elegant beaded necklaces and pearl chokers crafted with artisan precision', 2),
  ('Earrings', 'earrings', 'Drop, stud, and hoop earrings with beaded and pearl detailing', 3),
  ('Beaded Bags', 'beaded-bags', 'Handcrafted clutch, handbag, crossbody & mini beaded bags', 4),
  ('Tasbihs', 'tasbihs', 'Custom name, crystal & personalized prayer beads', 5),
  ('Gift Sets', 'gift-sets', 'Curated jewellery gift boxes for every occasion', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Products
-- ============================================================
INSERT INTO products (name, slug, description, short_description, price, compare_price, category_id, images, materials, stock, is_featured, is_new, rating, review_count, tags) VALUES
  (
    'Noir Royale Bracelet',
    'noir-royale-bracelet',
    'A masterpiece from the heart of our collection. The Noir Royale Bracelet features hand-selected black crystal beads paired with lustrous gold accents, creating a statement piece that commands attention. Each bead is meticulously placed by our artisans, ensuring flawless symmetry and lasting quality. The gold chain clasp adds a touch of regal elegance, making this bracelet perfect for both everyday wear and special occasions.',
    'Black Crystal Beads · Gold Accents · Chain Clasp',
    45.00, 65.00,
    (SELECT id FROM categories WHERE slug = 'bracelets'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.26 PM.jpeg'],
    'Black Crystal Beads, 18K Gold-Plated Accents, Stainless Steel Clasp',
    25, TRUE, FALSE, 4.9, 284, ARRAY['bestseller', 'crystal']
  ),
  (
    'Royal Sapphire Bracelet',
    'royal-sapphire-bracelet',
    'Inspired by the deep blue of sapphire gemstones, this bracelet combines royal blue beads with delicate gold chain links and a stunning tassel charm. The stretch-fit design ensures comfortable wear for any wrist size, while the rich color palette makes it a versatile accessory for day-to-night styling.',
    'Royal Blue Beads · Gold Chain · Tassel Charm',
    50.00, 70.00,
    (SELECT id FROM categories WHERE slug = 'bracelets'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.29 PM.jpeg'],
    'Royal Blue Glass Beads, Gold-Plated Chain, Silk Tassel',
    18, TRUE, TRUE, 4.8, 193, ARRAY['new', 'blue']
  ),
  (
    'Blush Crystal Bag',
    'blush-crystal-bag',
    'Our most coveted beaded bag, the Blush Crystal is a true work of art. Thousands of hand-threaded pink crystal beads create a mesmerizing mosaic pattern, while the satin-lined interior protects your essentials in style. The structured top-handle design elevates any outfit from casual to couture.',
    'Pink Crystal Beads · Satin Lined · Top Handle',
    120.00, 160.00,
    (SELECT id FROM categories WHERE slug = 'beaded-bags'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.33 PM.jpeg'],
    'Pink Crystal Beads, Satin Lining, Metal Frame, Gold-Plated Handle',
    8, TRUE, FALSE, 5.0, 147, ARRAY['limited', 'pink', 'bag']
  ),
  (
    'Midnight Noir Bag',
    'midnight-noir-bag',
    'Sophistication meets artistry in the Midnight Noir Bag. Black faceted beads catch the light with every movement, creating a dynamic shimmer effect. The detachable gold chain strap allows you to wear it as a clutch or crossbody, making it the ultimate versatile evening accessory.',
    'Black Faceted Beads · Gold Chain Strap · Clasp Lock',
    135.00, 180.00,
    (SELECT id FROM categories WHERE slug = 'beaded-bags'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.48 PM (1).jpeg'],
    'Black Faceted Crystal Beads, Gold-Plated Chain, Magnetic Clasp',
    12, TRUE, FALSE, 4.7, 221, ARRAY['bestseller', 'black', 'bag']
  ),
  (
    'Ruby Blaze Bracelet',
    'ruby-blaze-bracelet',
    'Ignite your style with the Ruby Blaze Bracelet. Vivid red crystal beads are woven together with gold wire to create a bracelet that radiates warmth and confidence. The lobster clasp ensures secure wear, while an adjustable chain allows the perfect fit.',
    'Red Crystal Beads · Gold Wire · Lobster Clasp',
    40.00, 55.00,
    (SELECT id FROM categories WHERE slug = 'bracelets'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.35 PM.jpeg'],
    'Red Crystal Beads, Gold-Plated Wire, Lobster Clasp',
    30, FALSE, TRUE, 4.6, 108, ARRAY['new', 'red']
  ),
  (
    'Butterfly Dream Bracelet',
    'butterfly-dream-bracelet',
    'Delicate and dreamy, the Butterfly Dream Bracelet features smoky crystal beads complemented by an intricately detailed butterfly charm. The stretch-fit design makes it easy to wear solo or stacked with other bracelets for a layered look.',
    'Smoky Crystal · Butterfly Charm · Stretch Fit',
    35.00, 50.00,
    (SELECT id FROM categories WHERE slug = 'bracelets'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.42 PM (1).jpeg'],
    'Smoky Quartz Crystal, Alloy Butterfly Charm, Elastic Band',
    22, FALSE, FALSE, 4.5, 89, ARRAY['charm', 'smoky']
  ),
  (
    'Custom Name Tasbih',
    'custom-name-tasbih',
    'A deeply personal piece, our Custom Name Tasbih is crafted with black crystal beads and personalized letter beads spelling out your chosen name or word. Finished with a luxurious silk tassel, this tasbih makes a meaningful gift for loved ones or a cherished addition to your prayer routine.',
    'Black Crystal · Personalized Letters · Silk Tassel',
    55.00, 75.00,
    (SELECT id FROM categories WHERE slug = 'tasbihs'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.48 PM (2).jpeg'],
    'Black Crystal Beads, Acrylic Letter Beads, Silk Tassel',
    40, TRUE, FALSE, 4.9, 162, ARRAY['bestseller', 'custom', 'personalized']
  ),
  (
    'Teal Charm Bracelet',
    'teal-charm-bracelet',
    'Fresh and playful, the Teal Charm Bracelet combines teal agate beads with adorable flower and bow charms. The elastic band ensures comfortable all-day wear, while the vibrant color adds a pop of personality to any outfit.',
    'Teal Agate · Flower & Bow Charms · Elastic Band',
    38.00, 55.00,
    (SELECT id FROM categories WHERE slug = 'bracelets'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.47 PM.jpeg'],
    'Teal Agate Beads, Enamel Charms, Elastic Band',
    35, FALSE, TRUE, 4.4, 76, ARRAY['new', 'teal', 'charm']
  ),
  (
    'Pearl Cascade Necklace',
    'pearl-cascade-necklace',
    'Timeless elegance meets modern design in the Pearl Cascade Necklace. Freshwater pearls of varying sizes cascade along a delicate gold chain, creating a waterfall effect that flatters every neckline. This piece transitions effortlessly from office to evening.',
    'Freshwater Pearls · Gold Chain · Adjustable Length',
    85.00, 110.00,
    (SELECT id FROM categories WHERE slug = 'necklaces'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.34 PM (1).jpeg'],
    'Freshwater Pearls, 18K Gold-Plated Chain, Lobster Clasp',
    15, TRUE, TRUE, 4.8, 67, ARRAY['new', 'pearl', 'necklace']
  ),
  (
    'Rose Quartz Drop Earrings',
    'rose-quartz-drop-earrings',
    'Graceful rose quartz beads dangle from gold-plated hooks, catching the light with a soft pink luminescence. These drop earrings are lightweight enough for all-day wear yet impactful enough to elevate any look from casual to elegant.',
    'Rose Quartz Beads · Gold Hooks · Lightweight',
    32.00, 45.00,
    (SELECT id FROM categories WHERE slug = 'earrings'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.39 PM (1).jpeg'],
    'Natural Rose Quartz, 18K Gold-Plated Hooks, Hypoallergenic',
    28, FALSE, TRUE, 4.7, 54, ARRAY['new', 'earrings', 'rose']
  ),
  (
    'Artisan Gift Box — Luxe',
    'artisan-gift-box-luxe',
    'The ultimate jewellery gift experience. This curated gift box includes a crystal bracelet, matching earrings, and a beaded pouch — all nestled in our signature rose-gold packaging with a handwritten note. Perfect for birthdays, anniversaries, or just because.',
    'Crystal Bracelet + Earrings + Beaded Pouch',
    150.00, 200.00,
    (SELECT id FROM categories WHERE slug = 'gift-sets'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.49 PM (1).jpeg'],
    'Assorted Crystal Beads, Gold-Plated Accents, Signature Packaging',
    10, TRUE, FALSE, 5.0, 38, ARRAY['gift', 'limited', 'set']
  ),
  (
    'Emerald Vine Bracelet',
    'emerald-vine-bracelet',
    'Inspired by lush greenery, the Emerald Vine Bracelet features deep green crystal beads intertwined with gold vine-like links. The magnetic clasp makes it easy to put on and take off, while the nature-inspired design makes it a conversation starter.',
    'Emerald Green Crystal · Gold Vine Links · Magnetic Clasp',
    42.00, 60.00,
    (SELECT id FROM categories WHERE slug = 'bracelets'),
    ARRAY['/products/WhatsApp Image 2026-02-27 at 11.12.34 PM.jpeg'],
    'Green Crystal Beads, Gold-Plated Vine Links, Magnetic Clasp',
    20, FALSE, FALSE, 4.6, 92, ARRAY['green', 'nature']
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Coupons
-- ============================================================
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, max_uses, is_active) VALUES
  ('WELCOME10', 'Welcome discount — 10% off your first order', 'percentage', 10.00, 30.00, NULL, TRUE),
  ('AZEE20', 'Special 20% discount', 'percentage', 20.00, 50.00, 100, TRUE),
  ('FREESHIP', 'Free shipping on orders over $75', 'fixed', 10.00, 75.00, NULL, TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- ENABLE PUBLIC RLS POLICIES FOR PRODUCTS CATALOGUE
-- (Allows admin additions, updates & deletions to sync across all browsers)
-- ============================================================
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
