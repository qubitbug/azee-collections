import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Privacy Policy</span>
        </div>
        <h1>Privacy Policy</h1>
        <p>How we collect, protect, and handle your information at Azee Collections.</p>
      </div>

      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '800px', lineHeight: 1.8, fontSize: '15px', color: 'var(--text-body)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>1. Information We Collect</h3>
          <p style={{ marginBottom: '20px' }}>
            We collect personal information that you provide when placing an order, registering an account, or subscribing to our newsletter. This includes your name, email address, phone number, shipping address, and payment selection details.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>2. How We Use Your Data</h3>
          <p style={{ marginBottom: '20px' }}>
            Your information is strictly used to fulfill your orders, process payments, deliver parcels through courier partners, send order status updates, and improve your shopping experience.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>3. Data Security</h3>
          <p style={{ marginBottom: '20px' }}>
            We implement robust security measures to safeguard your personal data. We do not sell, trade, or transfer your personal information to third parties.
          </p>
        </div>
      </div>
    </>
  );
}
