import Link from 'next/link';

export default function TermsPage() {
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Terms of Service</span>
        </div>
        <h1>Terms of Service</h1>
        <p>Terms governing the use of the Azee Collections website and store.</p>
      </div>

      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '800px', lineHeight: 1.8, fontSize: '15px', color: 'var(--text-body)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>1. General Terms</h3>
          <p style={{ marginBottom: '20px' }}>
            By placing an order on Azee Collections, you agree to these Terms of Service. All items listed are handcrafted beaded jewellery and accessories. Minor variations in bead color or texture are inherent to handmade products and celebrate artisan authenticity.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>2. Pricing & Currency</h3>
          <p style={{ marginBottom: '20px' }}>
            All prices are listed in Pakistani Rupees (PKR / Rs.). Prices are subject to change without prior notice. We reserve the right to cancel orders in the event of pricing errors.
          </p>
        </div>
      </div>
    </>
  );
}
