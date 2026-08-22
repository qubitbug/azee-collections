'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: 'How long does shipping take within Pakistan?',
      a: 'We process orders within 1-2 business days. Delivery via courier takes 3-5 business days to all major cities across Pakistan including Lahore, Karachi, Islamabad, and Rawalpindi.'
    },
    {
      q: 'What are the delivery charges?',
      a: 'We charge a flat delivery rate of Rs. 200 nationwide. Orders above Rs. 5,000 qualify for FREE delivery!'
    },
    {
      q: 'Which payment methods do you accept?',
      a: 'We accept Cash on Delivery (COD), Direct Bank Transfer (Meezan Bank), EasyPaisa / JazzCash, and Payoneer invoices.'
    },
    {
      q: 'Can I order custom personalized name tasbihs or jewellery?',
      a: 'Yes! We specialize in custom name tasbihs and custom beaded designs. Please contact us on WhatsApp (+971 50 123 4567) or write to us through our Contact page.'
    },
    {
      q: 'What materials do you use for your jewellery?',
      a: 'We source high-grade Japanese Miyuki glass beads, genuine freshwater pearls, natural gemstones (such as rose quartz and teal agate), and 18K gold-plated hypoallergenic components.'
    },
    {
      q: 'What is your return & exchange policy?',
      a: 'Because our items are handcrafted and customized as per your desire, we do not accept returns. If an item arrives damaged in transit, please contact us on WhatsApp within 48 hours for a replacement.'
    }
  ];

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>FAQ</span>
        </div>
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about shipping, custom orders, and payments.</p>
      </div>

      <div className="faq-page">
        <div className="container">
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className={`faq-item ${openIndex === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
                  <span>{faq.q}</span>
                  <span className="faq-icon">+</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
