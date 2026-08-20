'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Our Story</span>
        </div>
        <h1>Our Story & Heritage</h1>
        <p>Crafting handmade beaded jewellery and pearl art with timeless elegance.</p>
      </div>

      <section className="about-banner" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <p className="section-eyebrow">✦ Artisan Craftsmanship</p>
              <h2 className="about-title">A Story Woven in<br /><em>Beads & Pearls</em></h2>
              <p className="about-text">
                Azee Collections was founded over a decade ago with a simple mission: to preserve and celebrate the delicate art of hand-woven beaded jewellery.
                Every piece in our studio is individually crafted by master artisans who dedicate hours to placing each crystal and pearl with mathematical precision.
              </p>
              <p className="about-text">
                From luxury beaded handbags to crystal tasbihs and pearl chokers, we select only premium materials including genuine freshwater pearls, natural gemstones, and Japanese Miyuki glass beads.
              </p>
            </div>
            <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: 'var(--radius)', border: '1px solid var(--border-dark)' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '16px', color: 'var(--rose)' }}>Our Philosophy</h3>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--text-body)', marginBottom: '16px' }}>
                We believe that jewellery is more than an accessory — it is a reflection of individuality and artistic expression. We reject mass production in favour of sustainable, ethical handcrafting.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span className="pay-badge" style={{ padding: '6px 14px', fontSize: '12px' }}>✨ 100% Handmade</span>
                <span className="pay-badge" style={{ padding: '6px 14px', fontSize: '12px' }}>💎 Premium Materials</span>
                <span className="pay-badge" style={{ padding: '6px 14px', fontSize: '12px' }}>🌿 Eco-Packaging</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
