'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatCurrency } from '@/lib/utils';
import { showToast } from '@/components/Toast';

export default function AccountPage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();

  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    fullName: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address_line1 || '',
    city: profile?.city || '',
    state: profile?.state || '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const past = JSON.parse(localStorage.getItem('azee_past_orders') || '[]');
      setOrders(past);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address_line1 || '',
        city: profile.city || '',
        state: profile.state || '',
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile({
      full_name: formData.fullName,
      phone: formData.phone,
      address_line1: formData.address,
      city: formData.city,
      state: formData.state,
    });

    setSaving(false);
    if (error) {
      showToast('Error updating profile');
    } else {
      showToast('Profile updated successfully! ✨');
    }
  };

  const initialLetter = (profile?.full_name || user?.email || 'Guest').charAt(0).toUpperCase();

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>My Account</span>
        </div>
        <h1>Customer Dashboard</h1>
        <p>Manage your orders, profile details, and wishlist.</p>
      </div>

      <div className="account-page">
        <div className="container">
          <div className="account-layout">
            {/* Sidebar Navigation */}
            <aside className="account-sidebar">
              <div className="account-user">
                <div className="account-avatar">{initialLetter}</div>
                <h4>{profile?.full_name || 'Valued Customer'}</h4>
                <p>{user?.email || 'customer@example.com'}</p>
              </div>

              <div className="account-nav">
                <Link href="/account" className="account-nav-link active">
                  👤 Profile & Details
                </Link>
                <Link href="/account/orders" className="account-nav-link">
                  📦 Order History ({orders.length})
                </Link>
                <Link href="/account/wishlist" className="account-nav-link">
                  ♡ Saved Wishlist ({wishlistCount})
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    showToast('Logged out');
                  }}
                  className="account-nav-link"
                  style={{ color: 'var(--error)', width: '100%', cursor: 'pointer', textAlign: 'left', border: 'none', background: 'none' }}
                >
                  🚪 Sign Out
                </button>
              </div>
            </aside>

            {/* Main Content Area */}
            <div className="account-content">
              {/* Quick Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-dark)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--rose)' }}>{orders.length}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Orders</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-dark)', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--rose)' }}>{wishlistCount}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Wishlist Items</div>
                </div>
              </div>

              {/* Profile Details Form */}
              <div className="auth-card" style={{ maxWidth: '100%' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '24px' }}>
                  Personal Information
                </h3>

                <form onSubmit={handleUpdateProfile}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Default Shipping Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Province</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '16px' }}>
                    <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
