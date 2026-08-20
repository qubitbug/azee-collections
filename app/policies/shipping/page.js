import Link from 'next/link';

export default function ShippingPolicyPage() {
  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Shipping & Returns</span>
        </div>
        <h1>Shipping & Delivery Policy</h1>
        <p>Information on nationwide courier delivery rates and timelines.</p>
      </div>

      <div style={{ padding: '60px 0 100px' }}>
        <div className="container" style={{ maxWidth: '800px', lineHeight: 1.8, fontSize: '15px', color: 'var(--text-body)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>Domestic Delivery (Pakistan)</h3>
          <p style={{ marginBottom: '12px' }}>• <strong>Flat Shipping Rate:</strong> Rs. 200 on all orders nationwide.</p>
          <p style={{ marginBottom: '12px' }}>• <strong>Free Delivery:</strong> Orders exceeding Rs. 5,000 qualify for FREE standard shipping.</p>
          <p style={{ marginBottom: '20px' }}>• <strong>Delivery Timeframe:</strong> 3-5 business days across major cities (Lahore, Karachi, Islamabad, Rawalpindi, Peshawar, Multan, Faisalabad, etc.).</p>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '12px' }}>Order Tracking</h3>
          <p style={{ marginBottom: '20px' }}>
            Once your parcel is dispatched, you will receive a tracking number via SMS/email to monitor your shipment status.
          </p>
        </div>
      </div>
    </>
  );
}
