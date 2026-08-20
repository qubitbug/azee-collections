import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Refund Policy</span>
        </div>
        <h1>Refund & Exchange Policy</h1>
        <p>Our commitment to customer satisfaction and easy returns.</p>
      </div>

      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '800px', lineHeight: 1.8, fontSize: '15px', color: 'var(--text-body)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>30-Day Money Back Guarantee</h3>
          <p style={{ marginBottom: '20px' }}>
            If you are not completely satisfied with your purchase, you may return unworn items in original condition and packaging within 30 days of receipt for an exchange or full refund.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>Damaged or Defective Items</h3>
          <p style={{ marginBottom: '20px' }}>
            If an item arrives damaged or broken, please notify us within 48 hours of delivery with photos via WhatsApp (+971 50 123 4567) and we will send a free replacement immediately.
          </p>
        </div>
      </div>
    </>
  );
}
