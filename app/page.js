'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { getStoredCategories, getStoredProducts } from '@/lib/products';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/Toast';

export default function HomePage() {
  const [loaderHidden, setLoaderHidden] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const trackRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    setCategoriesList(getStoredCategories());
    supabase.from('products').select('*, categories(name, slug)').then(({ data, error }) => {
      if (data && data.length > 0) {
        setProductsList(data);
      } else {
        setProductsList(getStoredProducts());
      }
    });
  }, []);

  // Page loader
  useEffect(() => {
    const timer = setTimeout(() => setLoaderHidden(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  // AOS observer
  useEffect(() => {
    if (!loaderHidden) return;
    const elements = document.querySelectorAll('[data-aos]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.aosDelay || 0;
          setTimeout(() => entry.target.classList.add('aos-animate'), parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    elements.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loaderHidden, filter]);

  // Counter animation
  useEffect(() => {
    if (!loaderHidden) return;
    document.querySelectorAll('.stat-num').forEach(counter => {
      const target = parseInt(counter.dataset.count);
      let count = 0;
      const step = target / (2000 / 16);
      const timer = setInterval(() => {
        count += step;
        if (count >= target) { count = target; clearInterval(timer); }
        counter.textContent = Math.floor(count);
      }, 16);
    });
  }, [loaderHidden]);

  // Scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const el = document.getElementById('scrollProgress');
      if (!el) return;
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      el.style.width = ((winScroll / height) * 100) + '%';

      const btt = document.getElementById('backToTop');
      if (btt) btt.classList.toggle('visible', window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Particles
  useEffect(() => {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `left:${Math.random()*100}%;width:${Math.random()*3+1}px;height:${Math.random()*3+1}px;animation-duration:${Math.random()*10+8}s;animation-delay:${Math.random()*8}s;opacity:${Math.random()*0.5+0.1};`;
      container.appendChild(p);
    }
  }, []);

  // Testimonials
  const testimonials = [
    { text: '"The Noir Royale Bracelet has completely changed my accessory game. Elegant, unique, and I get compliments every single day."', name: 'Aisha Al-Mansouri', location: 'Dubai, UAE', rating: '★★★★★', initial: 'A' },
    { text: '"The Royal Sapphire bracelet is an absolute dream. The craftsmanship is incredible — every bead is perfectly placed."', name: 'Sophie Laurent', location: 'Paris, France', rating: '★★★★★', initial: 'S' },
    { text: '"Azee Collections produces some of the finest handmade pieces I\'ve ever encountered. The Blush Crystal Bag is a masterpiece."', name: 'James Okafor', location: 'London, UK', rating: '★★★★★', initial: 'J' },
    { text: '"The packaging alone made me gasp. The Midnight Noir Bag — pure magic. Stunning beadwork and incredibly sophisticated."', name: 'Mei Lin Zhang', location: 'Shanghai, China', rating: '★★★★★', initial: 'M' },
    { text: '"Ordered the Custom Name Tasbih as a gift and it was absolutely perfect. The personalization and quality blew us away."', name: 'Priya Sharma', location: 'Mumbai, India', rating: '★★★★★', initial: 'P' },
    { text: '"World class customer service, fast shipping, and the most exquisite handmade jewellery I\'ve ever owned."', name: 'Carlos Rivera', location: 'New York, USA', rating: '★★★★½', initial: 'C' },
  ];
  const maxSlide = Math.max(0, testimonials.length - 3);

  const goToSlide = (index) => {
    const newSlide = Math.max(0, Math.min(index, maxSlide));
    setCurrentSlide(newSlide);
    if (trackRef.current) {
      const card = trackRef.current.querySelector('.testimonial-card');
      if (card) {
        const cardWidth = card.offsetWidth + 24;
        trackRef.current.style.transform = `translateX(-${newSlide * cardWidth}px)`;
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => {
        const next = prev >= maxSlide ? 0 : prev + 1;
        goToSlide(next);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [maxSlide]);

  // Products
  const filteredProducts = filter === 'all'
    ? productsList
    : filter === 'new'
      ? productsList.filter(p => p.is_new || p.tags?.includes('new'))
      : productsList.filter(p => p.categories?.slug === filter || p.category_id === filter);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    if (email) {
      showToast('Welcome to Azee Collections! ✨ Check your inbox.');
      e.target.querySelector('input').value = '';
    }
  };

  // Category icons
  const categoryIcons = {
    bracelets: (
      <svg viewBox="0 0 60 60" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="10" fill="#e8a0c0" opacity="0.9"/>
        <ellipse cx="30" cy="12" rx="7" ry="10" fill="#f4c2d8" opacity="0.8"/>
        <ellipse cx="30" cy="48" rx="7" ry="10" fill="#f4c2d8" opacity="0.8"/>
        <ellipse cx="12" cy="30" rx="10" ry="7" fill="#f4c2d8" opacity="0.8"/>
        <ellipse cx="48" cy="30" rx="10" ry="7" fill="#f4c2d8" opacity="0.8"/>
        <circle cx="30" cy="30" r="7" fill="#f7a0bB"/>
      </svg>
    ),
    necklaces: (
      <svg viewBox="0 0 60 60" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 10 Q30 50 45 10" fill="none" stroke="#c9a96e" strokeWidth="2"/>
        <circle cx="30" cy="42" r="6" fill="#e8a0c0" opacity="0.9"/>
        <circle cx="22" cy="30" r="3" fill="#c9a96e" opacity="0.7"/>
        <circle cx="38" cy="30" r="3" fill="#f4c2d8" opacity="0.7"/>
        <circle cx="30" cy="42" r="3" fill="#c9a96e"/>
      </svg>
    ),
    earrings: (
      <svg viewBox="0 0 60 60" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="18" r="5" fill="#c9a96e" opacity="0.9"/>
        <circle cx="38" cy="18" r="5" fill="#e8a0c0" opacity="0.9"/>
        <line x1="22" y1="23" x2="22" y2="50" stroke="#c9a96e" strokeWidth="1.5"/>
        <line x1="38" y1="23" x2="38" y2="50" stroke="#e8a0c0" strokeWidth="1.5"/>
        <circle cx="22" cy="32" r="3" fill="#f4c2d8"/>
        <circle cx="38" cy="35" r="3" fill="#c9a96e"/>
        <circle cx="22" cy="42" r="3.5" fill="#c9a96e"/>
        <circle cx="38" cy="45" r="3.5" fill="#f4c2d8"/>
      </svg>
    ),
    'beaded-bags': (
      <svg viewBox="0 0 60 60" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="20" fill="none" stroke="#8B5E3C" strokeWidth="3"/>
        <circle cx="30" cy="30" r="14" fill="none" stroke="#c9a96e" strokeWidth="2"/>
        <circle cx="18" cy="30" r="4" fill="#c9a96e" opacity="0.9"/>
        <circle cx="42" cy="30" r="4" fill="#e8a0c0" opacity="0.9"/>
        <circle cx="30" cy="18" r="4" fill="#8B5E3C" opacity="0.9"/>
        <circle cx="30" cy="42" r="4" fill="#f4c2d8" opacity="0.9"/>
      </svg>
    ),
    tasbihs: (
      <svg viewBox="0 0 60 60" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="18" fill="none" stroke="#7ecfcf" strokeWidth="2" opacity="0.6"/>
        <circle cx="30" cy="30" r="12" fill="none" stroke="#7ecfcf" strokeWidth="2" opacity="0.5"/>
        <circle cx="30" cy="30" r="6" fill="#7ecfcf" opacity="0.8"/>
        <circle cx="30" cy="12" r="3" fill="#7ecfcf" opacity="0.7"/>
        <circle cx="30" cy="48" r="3" fill="#7ecfcf" opacity="0.7"/>
        <circle cx="12" cy="30" r="3" fill="#7ecfcf" opacity="0.7"/>
        <circle cx="48" cy="30" r="3" fill="#7ecfcf" opacity="0.7"/>
      </svg>
    ),
    'gift-sets': (
      <svg viewBox="0 0 60 60" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="22" width="36" height="28" rx="4" fill="none" stroke="#e8a0c0" strokeWidth="2"/>
        <line x1="30" y1="22" x2="30" y2="50" stroke="#e8a0c0" strokeWidth="2"/>
        <path d="M30 22 Q22 10 18 22" fill="none" stroke="#c9a96e" strokeWidth="2"/>
        <path d="M30 22 Q38 10 42 22" fill="none" stroke="#c9a96e" strokeWidth="2"/>
        <circle cx="30" cy="36" r="4" fill="#f4c2d8" opacity="0.8"/>
      </svg>
    ),
  };

  const defaultCategoryIcon = (
    <svg viewBox="0 0 60 60" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="14" fill="none" stroke="#e8a0c0" strokeWidth="2"/>
      <circle cx="30" cy="30" r="6" fill="#c9a96e"/>
    </svg>
  );

  return (
    <>
      {/* Scroll Progress */}
      <div className="scroll-progress" id="scrollProgress"></div>

      {/* Page Loader */}
      <div className={`page-loader ${loaderHidden ? 'hidden' : ''}`}>
        <div className="loader-inner">
          <div className="loader-logo"><img src="/logo.png" alt="Azee Collections Logo" /></div>
          <div className="loader-brand">Azee Collections</div>
          <div className="loader-bar"><span></span></div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero" id="home">
        <div className="hero-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
          <div className="particles" id="particles"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <p className="hero-eyebrow" data-aos="fade-up">✦ Handcrafted Beaded Jewellery & Pearl Art</p>
            <h1 className="hero-title" data-aos="fade-up" data-aos-delay="100">
              The Art of<em>Beaded</em>Elegance
            </h1>
            <p className="hero-desc" data-aos="fade-up" data-aos-delay="200">
              Discover handcrafted beaded jewellery and pearl art accessories that tell your story. Each piece holds a universe of vibrant beads, artisan craft, and timeless beauty.
            </p>
            <div className="hero-cta" data-aos="fade-up" data-aos-delay="300">
              <Link href="/shop" className="btn-primary"><span>Shop Collection</span></Link>
              <Link href="/about" className="btn-ghost">Our Story</Link>
            </div>
            <div className="hero-stats" data-aos="fade-up" data-aos-delay="400">
              <div className="stat"><span className="stat-num" data-count="250">0</span><span className="stat-plus">+</span><span className="stat-label">Designs</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num" data-count="30">0</span><span className="stat-plus">k+</span><span className="stat-label">Happy Clients</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><span className="stat-num" data-count="10">0</span><span className="stat-plus">+</span><span className="stat-label">Years Crafting</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="bottle-showcase">
              <div className="bottle-glow"></div>
              <div className="hero-logo-frame" style={{
                position: 'relative',
                width: '360px',
                height: '360px',
                borderRadius: '50%',
                background: '#FAF2D3',
                boxShadow: '0 24px 80px rgba(196, 96, 122, 0.35), 0 0 50px rgba(201, 169, 110, 0.3)',
                border: '4px solid rgba(201, 169, 110, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                overflow: 'hidden',
                animation: 'float 6s ease-in-out infinite',
                margin: '0 auto'
              }}>
                <img
                  src="/logo.png"
                  alt="Azee Collection Official Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              </div>
              <div className="bottle-shadow"></div>
              <div className="floating-badge badge-1"><span className="badge-icon">✦</span><span>New Arrival</span></div>
              <div className="floating-badge badge-2"><span className="badge-icon">📿</span><span>Handcrafted</span></div>
            </div>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <div className="scroll-line"></div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-strip">
        <div className="marquee-track">
          <span>✦ Noir Royale Bracelet</span><span>✦ Blush Crystal Bag</span><span>✦ Custom Name Tasbih</span><span>✦ Pearl Cascade Necklace</span>
          <span>✦ Rose Quartz Earrings</span><span>✦ Midnight Noir Bag</span><span>✦ Butterfly Dream</span><span>✦ Emerald Vine</span>
          <span>✦ Noir Royale Bracelet</span><span>✦ Blush Crystal Bag</span><span>✦ Custom Name Tasbih</span><span>✦ Pearl Cascade Necklace</span>
          <span>✦ Rose Quartz Earrings</span><span>✦ Midnight Noir Bag</span><span>✦ Butterfly Dream</span><span>✦ Emerald Vine</span>
        </div>
      </div>

      {/* Categories */}
      <section className="categories" id="categories">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <p className="section-eyebrow">✦ Explore</p>
            <h2 className="section-title">Jewellery & Art Styles</h2>
            <p className="section-sub">Every bead tells a story. Find your style.</p>
          </div>
          <div className="categories-grid">
            {categoriesList.map((cat, i) => (
              <Link href={`/shop?category=${cat.slug}`} key={cat.id || cat.slug}>
                <div className="category-card" data-aos="fade-up" data-aos-delay={i * 100}>
                  <div className="cat-icon">{categoryIcons[cat.slug] || defaultCategoryIcon}</div>
                  <h3>{cat.name}</h3>
                  <p>{cat.description}</p>
                  <span className="cat-count">{productsList.filter(p => p.categories?.slug === cat.slug || p.category_id === cat.slug).length} Designs</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="collection" id="collection">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <p className="section-eyebrow">✦ Bestsellers</p>
            <h2 className="section-title">Signature Collection</h2>
            <p className="section-sub">Our most loved handmade pieces, chosen by thousands.</p>
          </div>

          <div className="filter-tabs" data-aos="fade-up">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            {categoriesList.map(cat => (
              <button key={cat.slug} className={`filter-btn ${filter === cat.slug ? 'active' : ''}`} onClick={() => setFilter(cat.slug)}>
                {cat.name}
              </button>
            ))}
            <button className={`filter-btn ${filter === 'new' ? 'active' : ''}`} onClick={() => setFilter('new')}>New</button>
          </div>

          <div className="products-grid">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>

          <div className="load-more-wrap" data-aos="fade-up">
            <Link href="/shop" className="btn-outline">View Full Collection</Link>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about-banner" id="about">
        <div className="about-bg"><div className="orb orb-1" style={{width:'600px',height:'600px',top:'-150px',left:'-150px'}}></div></div>
        <div className="container">
          <div className="about-grid">
            <div className="about-visual" data-aos="fade-right">
              <div className="about-bottle-wrap">
                <svg className="about-bottle" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
                  {/* Beaded Necklace illustration instead of perfume bottle */}
                  <defs>
                    <linearGradient id="aboutBeadGrad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor:'#E8A0B4',stopOpacity:1}}/><stop offset="100%" style={{stopColor:'#C4607A',stopOpacity:1}}/></linearGradient>
                    <linearGradient id="aboutBeadGrad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor:'#c9a96e',stopOpacity:1}}/><stop offset="100%" style={{stopColor:'#8b6914',stopOpacity:1}}/></linearGradient>
                  </defs>
                  <path d="M40 60 Q100 240 160 60" fill="none" stroke="#c9a96e" strokeWidth="2.5" opacity="0.6"/>
                  {/* Beads along the necklace path */}
                  <circle cx="40" cy="60" r="8" fill="url(#aboutBeadGrad1)"/>
                  <circle cx="48" cy="90" r="7" fill="url(#aboutBeadGrad2)"/>
                  <circle cx="58" cy="118" r="9" fill="url(#aboutBeadGrad1)"/>
                  <circle cx="70" cy="142" r="7" fill="url(#aboutBeadGrad2)"/>
                  <circle cx="82" cy="165" r="10" fill="url(#aboutBeadGrad1)"/>
                  <circle cx="94" cy="185" r="8" fill="url(#aboutBeadGrad2)"/>
                  {/* Center pendant */}
                  <circle cx="100" cy="210" r="16" fill="url(#aboutBeadGrad1)" opacity="0.9"/>
                  <circle cx="100" cy="210" r="8" fill="#c9a96e"/>
                  <circle cx="100" cy="210" r="4" fill="#fff" opacity="0.3"/>
                  {/* Right side */}
                  <circle cx="106" cy="185" r="8" fill="url(#aboutBeadGrad2)"/>
                  <circle cx="118" cy="165" r="10" fill="url(#aboutBeadGrad1)"/>
                  <circle cx="130" cy="142" r="7" fill="url(#aboutBeadGrad2)"/>
                  <circle cx="142" cy="118" r="9" fill="url(#aboutBeadGrad1)"/>
                  <circle cx="152" cy="90" r="7" fill="url(#aboutBeadGrad2)"/>
                  <circle cx="160" cy="60" r="8" fill="url(#aboutBeadGrad1)"/>
                  {/* Label */}
                  <text x="100" y="265" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#E8A0B4" fontStyle="italic">Azee</text>
                  <text x="100" y="280" textAnchor="middle" fontFamily="serif" fontSize="6" fill="#c9a96e" letterSpacing="3">COLLECTIONS</text>
                </svg>
                <div className="about-circle-deco"></div>
                <div className="about-tag tag-a">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#C4607A"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                  <span>Artisan Made</span>
                </div>
                <div className="about-tag tag-b"><span className="tag-emoji">🌍</span><span>Worldwide Ship</span></div>
              </div>
            </div>
            <div className="about-content" data-aos="fade-left">
              <p className="section-eyebrow">✦ Our Heritage</p>
              <h2 className="about-title">A Story Woven<br /><em>in Beads & Pearls</em></h2>
              <p className="about-text">
                Founded over a decade ago, Azee Collections was born from a singular passion — to create the most
                extraordinary handmade beaded jewellery and pearl art in the world. We source the finest beads, crystals, and
                gemstones from artisan suppliers around the globe.
              </p>
              <p className="about-text">
                Each piece is a masterpiece, crafted by our skilled artisans who balance tradition with modern design. We
                believe great jewellery doesn&apos;t just adorn — it empowers, it expresses, it inspires.
              </p>
              <div className="about-features">
                <div className="about-feat"><div className="feat-icon">📿</div><div><h4>100% Handcrafted</h4><p>Every bead placed with love and precision</p></div></div>
                <div className="about-feat"><div className="feat-icon">💎</div><div><h4>Premium Materials</h4><p>Natural gemstones, crystals & freshwater pearls</p></div></div>
                <div className="about-feat"><div className="feat-icon">♻️</div><div><h4>Eco-Friendly Packaging</h4><p>Beautiful packaging that cares for the planet</p></div></div>
              </div>
              <Link href="/about" className="btn-primary"><span>Read Our Story</span></Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <p className="section-eyebrow">✦ Process</p>
            <h2 className="section-title">From Our Studio To Your Style</h2>
          </div>
          <div className="steps-grid">
            {[
              { num: '01', icon: '💎', title: 'Select', text: 'We handpick premium beads, crystals, and gemstones from trusted artisan suppliers worldwide.' },
              { num: '02', icon: '✋', title: 'Craft', text: 'Our skilled artisans weave each piece by hand with precision, creating unique beaded patterns.' },
              { num: '03', icon: '✨', title: 'Polish', text: 'Each piece is inspected, polished, and perfected — ensuring flawless quality you can feel.' },
              { num: '04', icon: '🎁', title: 'Deliver', text: 'Elegantly gift-wrapped and shipped worldwide with care, ensuring a luxurious unboxing.' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'contents' }}>
                <div className="step-card" data-aos="fade-up" data-aos-delay={i * 100}>
                  <div className="step-num">{step.num}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
                {i < 3 && <div className="step-connector" data-aos="fade-up" data-aos-delay={i * 100 + 50}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-header" data-aos="fade-up">
            <p className="section-eyebrow">✦ Reviews</p>
            <h2 className="section-title">Words From Our Community</h2>
            <p className="section-sub">Join over 30,000 jewellery lovers who trust Azee Collections.</p>
          </div>
          <div className="testimonials-carousel">
            <div className="testimonials-track" ref={trackRef}>
              {testimonials.map((t, i) => (
                <div className="testimonial-card" key={i}>
                  <p className="testimonial-text">{t.text}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">{t.initial}</div>
                    <div className="author-info"><h5>{t.name}</h5><span>{t.location}</span></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-controls">
              <button className="carousel-btn" onClick={() => goToSlide(currentSlide - 1)}>←</button>
              <div className="carousel-dots">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button key={i} className={`carousel-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => goToSlide(i)} aria-label={`Slide ${i+1}`} />
                ))}
              </div>
              <button className="carousel-btn" onClick={() => goToSlide(currentSlide + 1)}>→</button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="newsletter-bg"><div className="orb orb-1" style={{width:'700px',height:'700px',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}></div></div>
        <div className="container">
          <div className="newsletter-inner" data-aos="zoom-in">
            <span className="newsletter-icon">✉️</span>
            <h2>The Sparkle of Exclusivity</h2>
            <p>Subscribe to get first access to new designs, exclusive offers, and style inspiration from our artisans.</p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn-primary"><span>Subscribe</span></button>
            </form>
            <p className="newsletter-note">No spam. Unsubscribe anytime. We respect your privacy.</p>
          </div>
        </div>
      </section>

      {/* Back to Top */}
      <button className="back-to-top" id="backToTop" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Back to top">↑</button>
    </>
  );
}
