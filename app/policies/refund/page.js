import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Return & Refund Policy</span>
        </div>
        <h1>Return & Refund Policy</h1>
        <p>Information on custom orders, returns, and damaged item replacements.</p>
      </div>

      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '800px', lineHeight: 1.8, fontSize: '15px', color: 'var(--text-body)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>Custom Crafted Policy — No Returns</h3>
          <p style={{ marginBottom: '20px' }}>
            Because our items are handcrafted and customized as per your desire, <strong>we do not accept returns or exchanges</strong> once an order has been completed. Each piece is custom made specifically according to your preferences, style, and personalization.
          </p>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>Damaged or Incorrect Items</h3>
          <p style={{ marginBottom: '20px' }}>
            If your order arrives damaged during transit or if there is a mistake in your order, please notify us within 48 hours of delivery with photos on WhatsApp (<strong>+92 3462910394</strong>) or email (<strong>amal@azeecollections.com</strong>). We will happily send a free replacement to you immediately.
          </p>
        </div>
      </div>
    </>
  );
}
