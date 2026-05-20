// _pages.jsx — Working footer links, static page modals (Our Story, Karigars, Privacy, Shipping, Returns)

// ─── Static page content ──────────────────────────────────────────────────────
const PAGES = {
  story: {
    title: 'Our Story',
    body: `
      <p>Aman Creations was born from a simple conviction: that a gift should carry meaning, not just a price tag.</p>
      <p>We are a curated gifting house based in Lucknow, Uttar Pradesh — the city of tehzeeb, of nawabi refinement, of craft that has been passed down for centuries. Every product we offer is sourced directly from artisans and workshops across the region, each piece telling a story of skill and tradition.</p>
      <p>We don't ship from a warehouse. Every order is confirmed personally over WhatsApp, packed with care, and sent with intention. Whether it's a Chikankari tunic, a hand-cast brass diya, or a saffron hamper — you're not buying a product. You're giving someone a piece of Lucknow.</p>
      <h4>Why We Exist</h4>
      <p>India's craft heritage is vast and irreplaceable — yet many of the karigars who sustain it struggle to find buyers beyond their local markets. Aman Creations bridges that gap: connecting discerning gift-givers with authentic Lucknowi craft, and ensuring the artisans behind each piece receive fair recognition and compensation.</p>
      <h4>Our Promise</h4>
      <p>No middlemen. No mass production. Every item is handpicked, quality-checked, and delivered personally. If something doesn't meet our standard, we won't list it.</p>
    `
  },
  karigars: {
    title: 'The Karigars',
    body: `
      <p>Karigar — the Urdu word for craftsman — is at the heart of everything we do. Our products are made by master artisans whose families have practiced their crafts for generations in and around Lucknow.</p>
      <h4>Chikankari Embroiderers</h4>
      <p>Originating in the Mughal era, Chikankari is Lucknow's most celebrated textile art. Our embroiderers work in the old-city neighbourhoods of Aminabad and Chowk, producing intricate white-on-white thread work by hand — each piece taking days to complete.</p>
      <h4>Brass & Metal Craftsmen</h4>
      <p>Our brass diyas and decorative pieces come from dhaturkars (metal workers) who use traditional casting and hand-finishing techniques. No two pieces are identical — small variations are marks of the hand, not defects.</p>
      <h4>Fragrance Makers</h4>
      <p>Lucknow's attar tradition dates back to the Nawabs. Our ittar (attar) and fragrance products are blended by perfumers using cold-pressed and steam-distilled botanicals — rose, kewra, mitti, and saffron.</p>
      <h4>Weavers</h4>
      <p>Our Banarasi silk and Pashmina pieces are sourced from weavers in Varanasi and Kashmir respectively, ensuring authenticity of both material and technique.</p>
      <p style="margin-top:24px; color: var(--gold-light); font-style: italic;">When you order from Aman Creations, you directly support these artisans and the living traditions they carry.</p>
    `
  },
  privacy: {
    title: 'Privacy Policy',
    body: `
      <p><strong>Last updated: May 2026</strong></p>
      <h4>Information We Collect</h4>
      <p>When you contact us via WhatsApp or email to place an order, we collect your name, phone number, delivery address, and order details. We do not collect payment card information — all transactions are handled offline.</p>
      <h4>How We Use Your Information</h4>
      <p>Your information is used solely to process and deliver your order, and to communicate with you about it. We do not sell, share, or rent your personal data to any third parties.</p>
      <h4>Data Storage</h4>
      <p>Order information is stored securely and retained for up to 2 years for record-keeping purposes. You may request deletion of your data at any time by contacting us at amancreationslko@yahoo.com.</p>
      <h4>Cookies</h4>
      <p>This website uses browser localStorage to save your cart and wishlist between visits. No third-party tracking cookies are used.</p>
      <h4>Contact</h4>
      <p>For any privacy-related queries, write to us at <strong>amancreationslko@yahoo.com</strong>.</p>
    `
  },
  shipping: {
    title: 'Shipping Policy',
    body: `
      <h4>Delivery Coverage</h4>
      <p>We deliver pan-India via trusted courier partners (Delhivery, India Post, DTDC). International shipping is available on request — please contact us on WhatsApp for rates.</p>
      <h4>Delivery Timelines</h4>
      <ul>
        <li><strong>Lucknow & nearby UP cities:</strong> 2–3 business days</li>
        <li><strong>Metro cities (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad):</strong> 4–5 business days</li>
        <li><strong>Rest of India:</strong> 5–7 business days</li>
        <li><strong>Made-to-order items:</strong> 7–14 business days (confirmed on WhatsApp)</li>
      </ul>
      <h4>Shipping Charges</h4>
      <p>Shipping is free on orders above ₹2,000. For orders below ₹2,000, a flat shipping charge of ₹99 applies.</p>
      <h4>Packaging</h4>
      <p>All orders are packed in our branded gift-ready packaging. If you need additional gift wrapping or a personalised card, let us know on WhatsApp at the time of ordering.</p>
      <h4>Tracking</h4>
      <p>Once your order is dispatched, we'll share the tracking number on WhatsApp within 24 hours.</p>
      <h4>Delays</h4>
      <p>During festive seasons (Diwali, Eid, Holi) please allow an additional 2–3 business days. We will proactively inform you of any delays.</p>
    `
  },
  returns: {
    title: 'Returns & Refunds',
    body: `
      <h4>Return Window</h4>
      <p>We accept returns within <strong>7 days</strong> of delivery. Items must be unused, unwashed, and in their original packaging.</p>
      <h4>How to Return</h4>
      <p>WhatsApp us at +91 94150 21052 with your order details and a photo of the item. We'll arrange a pickup or provide a return address. Once we receive and inspect the item, a refund or exchange will be processed within 5–7 business days.</p>
      <h4>Non-Returnable Items</h4>
      <ul>
        <li>Custom or personalised orders</li>
        <li>Perishable items (saffron, food hampers)</li>
        <li>Fragrance products once opened</li>
        <li>Items damaged due to misuse</li>
      </ul>
      <h4>Damaged or Incorrect Items</h4>
      <p>If you receive a damaged or incorrect item, please WhatsApp us within 48 hours of delivery with a photo. We'll replace it or issue a full refund — no questions asked.</p>
      <h4>Refund Method</h4>
      <p>Refunds are issued to the original payment method (UPI / bank transfer) within 5–7 business days of return receipt.</p>
      <h4>Exchange</h4>
      <p>We're happy to exchange for a different size, colour, or product of equal value. Just mention it when you initiate the return.</p>
    `
  },
};

// ─── Modal CSS ────────────────────────────────────────────────────────────────
const _pagesCss = document.createElement('style');
_pagesCss.textContent = `
.pg-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); z-index:9000;
  display:flex; align-items:center; justify-content:center; padding:20px;
  animation: pgFadeIn .2s ease; }
@keyframes pgFadeIn { from { opacity:0 } to { opacity:1 } }
.pg-modal { background:#111; border:1px solid var(--border); max-width:680px; width:100%;
  max-height:88vh; overflow-y:auto; position:relative; }
.pg-modal-head { padding:28px 32px 20px; border-bottom:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between; position:sticky;
  top:0; background:#111; z-index:1; }
.pg-modal-head h2 { font-family:var(--font-display); font-size:22px; font-weight:500;
  color:var(--text); margin:0; }
.pg-modal-close { background:none; border:1px solid var(--border); color:var(--text-dim);
  width:32px; height:32px; cursor:pointer; font-size:18px; display:flex;
  align-items:center; justify-content:center; flex-shrink:0; }
.pg-modal-close:hover { border-color:var(--gold); color:var(--gold); }
.pg-modal-body { padding:28px 32px 36px; font-size:14px; line-height:1.8;
  color:var(--text-dim); }
.pg-modal-body p { margin:0 0 16px; }
.pg-modal-body h4 { font-family:var(--font-display); font-size:16px; font-weight:500;
  color:var(--text); margin:24px 0 10px; }
.pg-modal-body h4:first-child { margin-top:0; }
.pg-modal-body ul { padding-left:20px; margin:0 0 16px; }
.pg-modal-body ul li { margin-bottom:6px; }
.pg-modal-body strong { color:var(--text); }
.footer-col li { cursor:pointer; }
.footer-col li:hover { color:var(--gold-light) !important; }
.footer-bottom-links a { cursor:pointer; }
.footer-bottom-links a:hover { color:var(--gold-light); }
@media (max-width:600px) {
  .pg-modal-head { padding:20px 20px 16px; }
  .pg-modal-body { padding:20px 20px 28px; }
}
`;
document.head.appendChild(_pagesCss);

// ─── PageModal component ──────────────────────────────────────────────────────
const PageModal = ({ pageKey, onClose }) => {
  const page = PAGES[pageKey];
  if (!page) return null;
  return (
    <div className="pg-overlay" onClick={onClose}>
      <div className="pg-modal" onClick={e => e.stopPropagation()}>
        <div className="pg-modal-head">
          <h2>{page.title}</h2>
          <button className="pg-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="pg-modal-body" dangerouslySetInnerHTML={{ __html: page.body }} />
      </div>
    </div>
  );
};

// ─── Enhanced Footer override ─────────────────────────────────────────────────
window.Footer = ({ onWhatsApp, onSectionClick }) => {
  const [modal, setModal] = React.useState(null);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });
    if (onSectionClick) onSectionClick(id);
  };

  const waCustom = () => {
    const msg = "Hi! I'd like to discuss a custom order. Can you help me out?";
    window.open('https://wa.me/919415021052?text=' + encodeURIComponent(msg), '_blank');
  };

  return (
    <>
      {modal && <PageModal pageKey={modal} onClose={() => setModal(null)} />}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="nav-logo-mark" style={{ fontSize:28 }}>
                Aman <em style={{ color:'var(--gold)' }}>Creations</em>
              </div>
              <p className="footer-tagline">
                A house of curated gifts and Lucknowi craft. Made by hand in our atelier; sent with intention across India.
              </p>
              <div className="footer-socials">
                <a className="icon-btn" onClick={onWhatsApp} style={{ cursor:'pointer' }}><Icon name="whatsapp" size={16} /></a>
                <a className="icon-btn" href="https://instagram.com/amancreationlko" target="_blank" rel="noreferrer"><Icon name="instagram" size={16} /></a>
                <a className="icon-btn" href="https://facebook.com" target="_blank" rel="noreferrer"><Icon name="facebook" size={16} /></a>
                <a className="icon-btn" href="https://twitter.com" target="_blank" rel="noreferrer"><Icon name="twitter" size={16} /></a>
              </div>
            </div>

            <div className="footer-col">
              <h5>Shop</h5>
              <ul>
                <li onClick={() => scrollTo('collections')}>Collections</li>
                <li onClick={() => scrollTo('offers')}>Offers &amp; Bundles</li>
                <li onClick={() => scrollTo('collections')}>New Arrivals</li>
                <li onClick={() => scrollTo('collections')}>Bestsellers</li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>House</h5>
              <ul>
                <li onClick={() => setModal('story')}>Our Story</li>
                <li onClick={() => setModal('karigars')}>The Karigars</li>
                <li onClick={waCustom}>Custom Orders</li>
                <li onClick={() => scrollTo('contact')}>Contact</li>
              </ul>
            </div>

            <div className="footer-col">
              <h5>Reach Us</h5>
              <ul>
                <li><a href="tel:+919415021052" style={{ color:'inherit', textDecoration:'none' }}>+91 94150 21052</a></li>
                <li><a href="mailto:amancreationslko@yahoo.com" style={{ color:'inherit', textDecoration:'none' }}>amancreationslko@yahoo.com</a></li>
                <li><a href="https://maps.google.com/?q=Lucknow,UP,India" target="_blank" rel="noreferrer" style={{ color:'inherit', textDecoration:'none' }}>Lucknow, UP — 226001</a></li>
                <li style={{ fontSize:11, paddingTop:12, color:'var(--text-dim)' }}>GST No: 09AHJPG2457K1Z2</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>© 2026 Aman Creations. All rights reserved.</div>
            <div className="footer-bottom-links">
              <a onClick={() => setModal('privacy')}>Privacy</a>
              <a onClick={() => setModal('shipping')}>Shipping</a>
              <a onClick={() => setModal('returns')}>Returns</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
