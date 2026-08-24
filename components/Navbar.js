'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen(prev => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        <div className="navbar-inner">
          <Link href="/" className="nav-logo" onClick={closeMenu}>
            <img src="/logo.png" alt="Azee Collections" className="logo-img" />
            <span className="logo-text">Azee Collections</span>
          </Link>

          <nav className={`nav-links ${menuOpen ? 'open' : ''}`} id="navLinks">
            <button className="mobile-close-btn" onClick={closeMenu} aria-label="Close menu">✕</button>
            <Link href="/" className="nav-link" onClick={closeMenu}>Home</Link>
            <Link href="/shop" className="nav-link" onClick={closeMenu}>Shop Collection</Link>
            <Link href="/about" className="nav-link" onClick={closeMenu}>Our Story</Link>
            <Link href="/contact" className="nav-link" onClick={closeMenu}>Contact</Link>
            <Link href="/faq" className="nav-link" onClick={closeMenu}>FAQ</Link>
          </nav>

          <div className="nav-actions">
            <Link href="/shop" className="nav-icon-btn" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>

            <Link href="/account/wishlist" className="nav-icon-btn" aria-label="Wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>

            <button className="nav-icon-btn cart-btn" aria-label="Cart" onClick={openCart}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </button>

            <button className={`hamburger ${menuOpen ? 'active' : ''}`} id="hamburger" aria-label="Menu" onClick={toggleMenu}>
              <span style={menuOpen ? { transform: 'rotate(45deg) translate(5px, 5px)' } : {}}></span>
              <span style={menuOpen ? { opacity: 0 } : {}}></span>
              <span style={menuOpen ? { transform: 'rotate(-45deg) translate(5px, -5px)' } : {}}></span>
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile menu drawer */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 1998,
          }}
        />
      )}
    </>
  );
}
