// _admin.jsx — Firestore admin panel (images stored as compressed base64 in Firestore)

const ADMIN_CREDS = { email: 'amancreationslko@yahoo.com', password: 'Aman052!' };
const AC_AUTH_KEY = 'ac_adm_auth';

const MOTIF_OPTS = ['flora','geo','diamond','weave','lotus','drop','circle'];
const PALETTE_PRESETS = [
  { name:'Gold',    val:['#c9a84c','#8c7637','#e8d5a3'] },
  { name:'Rose',    val:['#c47b5a','#e8c8b0','#8c4a2a'] },
  { name:'Ivory',   val:['#f5f0e8','#c9a84c','#a09880'] },
  { name:'Dark',    val:['#1a1815','#c9a84c','#0d0d0d'] },
  { name:'Emerald', val:['#7CA982','#B5D6BB','#4a6e51'] },
];
const DEFAULT_SETTINGS = {
  phone:'+91 9415021052', whatsapp:'919415021052',
  instagram:'amancreationslko', email:'amancreationslko@yahoo.com',
  gst:'09AHJPG2457K1Z2', facebook:'', twitter:'',
  heroHeadline:'The Art of Gifting, Perfected.',
  heroSub:'Handpicked luxury gifts and Lucknowi craft — confirmed personally on WhatsApp, delivered with love from Lucknow.',
  siteTitle:'Aman Creations | Premium Gift Shop in Lucknow',
  metaDesc:'Handpicked luxury gifts and Lucknowi craft from Lucknow. Ordered personally on WhatsApp.',
  metaKeywords:'gifts lucknow chikankari premium gifting',
};

// ─── Firebase helpers ────────────────────────────────────────────────────────
const fdb = () => window._db;

const genCode = (n) => 'AC-' + String(n).padStart(6, '0');

// Compress image file to a base64 JPEG, max 900px on longest side, quality 0.75
// Keeps each image under ~150KB as base64 — safe for Firestore's 1MB doc limit
const compressImage = (file) => new Promise((resolve, reject) => {
  const MAX = 900;
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = (e) => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const ratio = Math.min(1, MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width  * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

// ─── Storefront data loader (called by Root before rendering) ─────────────────
window.loadStorefrontData = async () => {
  try {
    const [prodSnap, secSnap, offSnap] = await Promise.all([
      fdb().collection('products').orderBy('display_order').get(),
      fdb().collection('sections').orderBy('display_order').get(),
      fdb().collection('offers').get(),
    ]);
    if (!prodSnap.empty) {
      window.PRODUCTS = prodSnap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter(p => p.is_visible !== false);
    }
    if (!secSnap.empty) {
      window.SECTIONS = ['All', ...secSnap.docs.map(d => d.data().name)];
    }
    if (!offSnap.empty) {
      window.OFFERS = offSnap.docs
        .map(d => ({ ...d.data(), id: d.id }))
        .filter(o => o.is_visible !== false);
    }
  } catch(e) {
    console.warn('[AC] Firestore load failed, using defaults:', e.message);
  }
};

window.syncAdminToStorefront = () => window.loadStorefrontData();

// ─── Override ProductCard / ProductModal for real image URLs ─────────────────
const _OrigPC = window.ProductCard;
const _OrigPM = window.ProductModal;

window.ProductCard = (props) => {
  const { product, wished, onWish, onAddToCart, onOpen } = props;
  const [imgIdx, setImgIdx] = React.useState(0);
  const urls = product.imageData;
  if (!urls || !urls.length) return <_OrigPC {...props} />;
  return (
    <article className="product-card" onClick={() => onOpen(product)}>
      <div className="product-card-media" style={{ overflow:'hidden' }}>
        <img src={urls[imgIdx]} alt={product.name}
          style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className={"product-wish "+(wished?'active':'')}
          onClick={e => { e.stopPropagation(); onWish(product); }} aria-label="Wishlist">
          <Icon name="heart" size={14} />
        </button>
        {urls.length > 1 && (
          <div className="image-dots" onClick={e => e.stopPropagation()}>
            {urls.map((_,i) => (
              <span key={i} className={i===imgIdx?'active':''}
                onClick={e => { e.stopPropagation(); setImgIdx(i); }} />
            ))}
          </div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-meta"><span>{product.section}</span><span>#{product.code}</span></div>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-desc">{product.short}</p>
        <div className="product-card-foot">
          <div className="product-price"><span className="rupee">₹</span>{product.price.toLocaleString('en-IN')}</div>
          <button className="product-card-add" onClick={e => { e.stopPropagation(); onAddToCart(product); }}>
            Add <Icon name="plus" size={12} />
          </button>
        </div>
      </div>
    </article>
  );
};

window.ProductModal = ({ product, onClose, onAddToCart }) => {
  const [qty, setQty] = React.useState(1);
  const [imgIdx, setImgIdx] = React.useState(0);
  React.useEffect(() => { if (product) { setQty(1); setImgIdx(0); } }, [product?.id]);
  if (!product) return null;
  const urls = product.imageData;
  if (!urls || !urls.length) return <_OrigPM product={product} onClose={onClose} onAddToCart={onAddToCart} />;
  return (
    <div className="product-modal open">
      <button className="icon-btn pm-close" onClick={onClose}><Icon name="x" size={16} /></button>
      <div className="container">
        <div className="pm-grid">
          <div className="pm-gallery">
            <div className="pm-gallery-main">
              <img src={urls[imgIdx]} alt={product.name}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </div>
            {urls.length > 1 && (
              <div className="pm-thumbs">
                {urls.map((url,i) => (
                  <div key={i} className={"pm-thumb "+(i===imgIdx?'active':'')} onClick={() => setImgIdx(i)}>
                    <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pm-info">
            <div style={{ display:'flex', gap:14, color:'var(--text-dim)', fontSize:11, letterSpacing:'.22em', textTransform:'uppercase' }}>
              <span>{product.section}</span><span>·</span><span>#{product.code}</span>
              {product.badge && <><span>·</span><span style={{ color:'var(--gold-light)' }}>{product.badge}</span></>}
            </div>
            <h1 className="pm-name">{product.name}</h1>
            <p className="pm-desc">{product.short}</p>
            <div className="pm-divider" />
            <div className="pm-price"><span style={{ fontSize:28, opacity:.85 }}>₹</span>{product.price.toLocaleString('en-IN')}</div>
            <div className="pm-divider" />
            <div className="pm-section-label">Details</div>
            <p className="pm-long">{product.long}</p>
            {product.instructions && <>
              <div className="pm-section-label" style={{ marginTop:24 }}>Care & Customisation</div>
              <div className="pm-specials">{product.instructions}</div>
            </>}
            <div className="pm-actions">
              <div className="pm-qty">
                <button onClick={() => setQty(Math.max(1,qty-1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty+1)}>+</button>
              </div>
              <button className="btn btn-gold pm-add" onClick={() => { onAddToCart(product,qty); onClose(); }}>
                Add to Cart · ₹{(product.price*qty).toLocaleString('en-IN')}
              </button>
              <button className="btn btn-ghost pm-whats" onClick={() =>
                openWhatsApp(`Hi! I'm interested in *${product.name}* (ID: #${product.code}). Can you tell me more?`)}>
                <Icon name="whatsapp" size={14} /> Ask on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Admin CSS ────────────────────────────────────────────────────────────────
const _adminCss = document.createElement('style');
_adminCss.textContent = `
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
.admin-layout { display:flex; min-height:100vh; background:var(--bg); font-family:var(--font-body); }
.adm-sidebar { width:220px; flex-shrink:0; background:#0e0e0e; border-right:1px solid var(--border);
  display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow-y:auto; }
.adm-sidebar-logo { padding:24px 20px 16px; border-bottom:1px solid var(--border); }
.adm-sidebar-logo h2 { font-family:var(--font-display); font-size:20px; font-weight:500; margin:0; color:var(--text); }
.adm-sidebar-logo h2 em { color:var(--gold); font-style:italic; }
.adm-sidebar-logo small { display:block; font-size:10px; letter-spacing:.3em; text-transform:uppercase; color:var(--text-dim); margin-top:4px; }
.adm-nav { flex:1; padding:12px 0; }
.adm-nav-item { display:flex; align-items:center; gap:10px; padding:11px 20px; font-size:12.5px;
  letter-spacing:.04em; color:var(--text-dim); cursor:pointer; transition:all .15s; border:none;
  background:none; width:100%; text-align:left; }
.adm-nav-item:hover { color:var(--text); background:rgba(255,255,255,.04); }
.adm-nav-item.active { color:var(--gold); background:rgba(201,168,76,.08); border-left:2px solid var(--gold); }
.adm-sidebar-foot { padding:16px 20px; border-top:1px solid var(--border); }
.adm-main { flex:1; min-width:0; overflow-y:auto; }
.adm-topbar { padding:18px 32px; border-bottom:1px solid var(--border); background:#0a0a0a;
  display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:10; }
.adm-topbar-title { font-size:13px; letter-spacing:.25em; text-transform:uppercase; color:var(--text-dim); }
.adm-content { padding:32px; max-width:1080px; }
.admin-login { min-height:100vh; display:flex; align-items:center; justify-content:center;
  background:var(--bg); padding:20px; }
.admin-login-card { background:var(--surface); border:1px solid var(--border); padding:44px;
  width:100%; max-width:420px; }
.admin-login-logo { font-family:var(--font-display); font-size:28px; font-weight:500; color:var(--text); }
.admin-login-logo em { color:var(--gold); font-style:italic; }
.admin-login-sub { font-size:11px; letter-spacing:.3em; text-transform:uppercase; color:var(--text-dim); margin-top:6px; }
.admin-error { background:rgba(196,123,90,.12); border:1px solid rgba(196,123,90,.35); color:#e8c8b0;
  padding:10px 14px; font-size:13px; margin-top:16px; }
.shake { animation:shake .5s ease; }
.adm-stats { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; margin-bottom:32px; }
.adm-stat { background:var(--surface); border:1px solid var(--border); padding:24px; }
.adm-stat-num { font-family:var(--font-accent); font-size:48px; font-weight:600; color:var(--gold); line-height:1; }
.adm-stat-label { font-size:11px; letter-spacing:.25em; text-transform:uppercase; color:var(--text-dim); margin-top:8px; }
.adm-table { width:100%; border-collapse:collapse; font-size:13px; }
.adm-table th { padding:10px 14px; text-align:left; font-size:10px; letter-spacing:.25em; text-transform:uppercase;
  color:var(--text-dim); border-bottom:1px solid var(--border); font-weight:500; }
.adm-table td { padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.04); vertical-align:middle; color:var(--text); }
.adm-table tr:hover td { background:rgba(255,255,255,.02); }
.adm-thumb { width:42px; height:42px; border-radius:2px; overflow:hidden; background:var(--surface-2); flex-shrink:0; }
.adm-thumb img { width:100%; height:100%; object-fit:cover; }
.adm-badge { display:inline-block; padding:3px 9px; font-size:10px; letter-spacing:.15em; text-transform:uppercase; border-radius:2px; }
.adm-badge-green { background:rgba(124,169,130,.15); color:#7CA982; border:1px solid rgba(124,169,130,.3); }
.adm-badge-gray  { background:rgba(160,152,128,.1); color:var(--text-dim); border:1px solid rgba(160,152,128,.2); }
.adm-badge-gold  { background:rgba(201,168,76,.12); color:var(--gold); border:1px solid rgba(201,168,76,.25); }
.adm-actions { display:flex; gap:8px; align-items:center; }
.adm-btn { font-family:var(--font-body); font-size:11px; letter-spacing:.08em; padding:6px 12px;
  border:1px solid var(--border); background:transparent; color:var(--text-dim); cursor:pointer; transition:all .15s; }
.adm-btn:hover { border-color:var(--gold); color:var(--gold); }
.adm-btn-danger:hover { border-color:#c47b5a; color:#c47b5a; }
.adm-btn-primary { background:var(--gold); color:#18130a; border-color:var(--gold); font-weight:500; }
.adm-btn-primary:hover { background:var(--gold-light); border-color:var(--gold-light); color:#18130a; }
.adm-btn:disabled { opacity:.4; cursor:not-allowed; }
.adm-form { max-width:720px; }
.adm-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.adm-form-grid .full { grid-column:1/-1; }
.adm-field { display:flex; flex-direction:column; gap:6px; }
.adm-field label { font-size:10px; letter-spacing:.25em; text-transform:uppercase; color:var(--text-dim); font-weight:500; }
.adm-field input, .adm-field select, .adm-field textarea {
  background:var(--surface); border:1px solid var(--border); color:var(--text);
  padding:10px 14px; font-family:var(--font-body); font-size:13px; outline:none;
  transition:border-color .15s; width:100%; box-sizing:border-box; }
.adm-field input:focus, .adm-field select:focus, .adm-field textarea:focus { border-color:var(--gold); }
.adm-field textarea { resize:vertical; min-height:80px; }
.adm-field select option { background:#1a1a1a; }
.adm-field-hint { font-size:11px; color:var(--text-dim); margin-top:2px; }
.adm-upload-zone { border:1.5px dashed var(--border); padding:28px; text-align:center; cursor:pointer; transition:border-color .2s; }
.adm-upload-zone:hover { border-color:var(--gold); }
.adm-upload-zone p { color:var(--text-dim); font-size:13px; margin:0; }
.adm-upload-zone small { font-size:11px; color:var(--text-dim); opacity:.6; margin-top:4px; display:block; }
.adm-img-previews { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
.adm-img-preview { position:relative; width:80px; height:80px; border:1px solid var(--border); overflow:hidden; }
.adm-img-preview img { width:100%; height:100%; object-fit:cover; }
.adm-img-preview button { position:absolute; top:2px; right:2px; background:rgba(0,0,0,.7);
  border:none; color:#fff; width:18px; height:18px; cursor:pointer; font-size:10px;
  display:flex; align-items:center; justify-content:center; border-radius:2px; }
.adm-img-cover { position:absolute; bottom:2px; left:2px; background:var(--gold);
  color:#18130a; font-size:8px; padding:1px 4px; letter-spacing:.1em; text-transform:uppercase; }
.adm-toggle { display:flex; align-items:center; gap:10px; cursor:pointer; }
.adm-toggle-track { width:36px; height:20px; border-radius:10px; background:#333; position:relative; transition:background .2s; flex-shrink:0; }
.adm-toggle-track.on { background:var(--gold); }
.adm-toggle-thumb { position:absolute; top:3px; left:3px; width:14px; height:14px; border-radius:50%; background:#fff; transition:transform .2s; }
.adm-toggle-track.on .adm-toggle-thumb { transform:translateX(16px); }
.adm-toggle-label { font-size:13px; color:var(--text); }
.adm-page-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
.adm-page-title { font-family:var(--font-display); font-size:24px; font-weight:500; color:var(--text); margin:0; }
.adm-page-sub { font-size:12px; color:var(--text-dim); margin-top:4px; }
.adm-search { background:var(--surface); border:1px solid var(--border); color:var(--text);
  padding:9px 14px; font-family:var(--font-body); font-size:13px; outline:none; width:260px; }
.adm-search:focus { border-color:var(--gold); }
.adm-multiselect { background:var(--surface); border:1px solid var(--border); padding:8px;
  display:flex; flex-wrap:wrap; gap:6px; min-height:44px; }
.adm-ms-chip { background:rgba(201,168,76,.12); border:1px solid rgba(201,168,76,.25);
  color:var(--gold-light); padding:4px 10px; font-size:11px; cursor:pointer; display:flex; align-items:center; gap:6px; }
.adm-ms-chip button { background:none; border:none; color:inherit; cursor:pointer; padding:0; font-size:12px; line-height:1; }
.adm-ms-add { background:var(--surface-2); border:1px solid var(--border); color:var(--text-dim);
  padding:4px 10px; font-size:11px; cursor:pointer; }
.adm-ms-add:hover { border-color:var(--gold); color:var(--gold); }
.adm-ms-dropdown { position:absolute; background:#1a1a1a; border:1px solid var(--border);
  z-index:200; min-width:200px; max-height:180px; overflow-y:auto; }
.adm-ms-opt { padding:8px 14px; font-size:13px; cursor:pointer; color:var(--text); }
.adm-ms-opt:hover { background:rgba(201,168,76,.08); color:var(--gold); }
.adm-divider { border:none; border-top:1px solid var(--border); margin:24px 0; }
.adm-notice { background:rgba(201,168,76,.07); border:1px solid rgba(201,168,76,.2);
  padding:14px 18px; font-size:13px; color:var(--text-dim); margin-bottom:24px; }
.adm-notice strong { color:var(--gold-light); }
.adm-sf-link { display:inline-flex; align-items:center; gap:8px; font-size:11px;
  letter-spacing:.2em; text-transform:uppercase; color:var(--text-dim); padding:8px 0; cursor:pointer; }
.adm-sf-link:hover { color:var(--gold); }
.adm-spinner { width:22px; height:22px; border:2px solid var(--border); border-top-color:var(--gold);
  border-radius:50%; animation:spin .7s linear infinite; margin:40px auto; display:block; }
@media (max-width:760px) {
  .admin-layout { flex-direction:column; }
  .adm-sidebar { width:100%; height:auto; position:relative; }
  .adm-main { width:100%; }
  .adm-content { padding:20px; }
  .adm-form-grid { grid-template-columns:1fr; }
  .adm-form-grid .full { grid-column:1; }
}
`;
document.head.appendChild(_adminCss);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const AdmToggle = ({ value, onChange, label }) => (
  <div className="adm-toggle" onClick={() => onChange(!value)}>
    <div className={"adm-toggle-track "+(value?'on':'')}>
      <div className="adm-toggle-thumb" />
    </div>
    {label && <span className="adm-toggle-label">{label}</span>}
  </div>
);

const AdmSpinner = () => <div className="adm-spinner" />;

// ─── AdminLogin ───────────────────────────────────────────────────────────────
const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [pw, setPw]       = React.useState('');
  const [err, setErr]     = React.useState('');
  const [shake, setShake] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email === ADMIN_CREDS.email && pw === ADMIN_CREDS.password) {
      localStorage.setItem(AC_AUTH_KEY, 'ok');
      onLogin();
    } else {
      setErr('Invalid credentials. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="admin-login">
      <form className={"admin-login-card "+(shake?'shake':'')} onSubmit={submit}>
        <div className="admin-login-logo">Aman <em>Creations</em></div>
        <div className="admin-login-sub">Admin Panel · Restricted Access</div>
        <div className="adm-field" style={{ marginTop:28 }}>
          <label>Email</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="amancreationslko@yahoo.com" autoComplete="email" />
        </div>
        <div className="adm-field" style={{ marginTop:16 }}>
          <label>Password</label>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
            placeholder="Password" autoComplete="current-password" />
        </div>
        {err && <div className="admin-error">{err}</div>}
        <button type="submit" className="btn btn-gold"
          style={{ width:'100%', marginTop:24, justifyContent:'center' }}>
          Sign In
        </button>
        <div style={{ marginTop:16, fontSize:11, color:'var(--text-dim)', textAlign:'center' }}>
          This panel is not linked from the public site.
        </div>
      </form>
    </div>
  );
};

// ─── AdminOverview ────────────────────────────────────────────────────────────
const AdminOverview = ({ products, sections, offers }) => (
  <div>
    <div className="adm-page-head">
      <div>
        <h2 className="adm-page-title">Dashboard</h2>
        <div className="adm-page-sub">Welcome back, Admin.</div>
      </div>
    </div>
    <div className="adm-notice">
      <strong>All orders are managed offline via WhatsApp.</strong> This panel manages what appears on the storefront. Changes are live immediately.
    </div>
    <div className="adm-stats">
      <div className="adm-stat">
        <div className="adm-stat-num">{products.length}</div>
        <div className="adm-stat-label">Products</div>
      </div>
      <div className="adm-stat">
        <div className="adm-stat-num">{products.filter(p=>p.is_visible!==false).length}</div>
        <div className="adm-stat-label">Visible</div>
      </div>
      <div className="adm-stat">
        <div className="adm-stat-num">{sections.length}</div>
        <div className="adm-stat-label">Sections</div>
      </div>
      <div className="adm-stat">
        <div className="adm-stat-num">{offers.length}</div>
        <div className="adm-stat-label">Offers</div>
      </div>
    </div>
    <div style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.8 }}>
      <p>Navigate to the storefront by clicking <strong style={{color:'var(--text)'}}>View Site</strong> in the sidebar, or clear the URL hash.</p>
      <p>Product images are stored in Firebase Storage. Data is saved to Firestore and is live across all devices instantly.</p>
    </div>
  </div>
);

// ─── ProductsList ─────────────────────────────────────────────────────────────
const ProductsList = ({ products, sections, onEdit, onDelete, onToggle, onAdd }) => {
  const [q, setQ]     = React.useState('');
  const [sec, setSec] = React.useState('All');
  const filtered = products.filter(p => {
    const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
    const matchS = sec==='All' || p.section===sec;
    return matchQ && matchS;
  });
  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h2 className="adm-page-title">Products</h2>
          <div className="adm-page-sub">{products.length} total · {products.filter(p=>p.is_visible!==false).length} visible</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={onAdd}>+ Add Product</button>
      </div>
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <input className="adm-search" placeholder="Search products…" value={q} onChange={e=>setQ(e.target.value)} />
        <select className="adm-search" style={{ width:'auto' }} value={sec} onChange={e=>setSec(e.target.value)}>
          <option>All</option>
          {sections.map(s => <option key={s.id}>{s.name}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <div style={{ padding:'40px 0', textAlign:'center', color:'var(--text-dim)' }}>No products found.</div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr><th>Image</th><th>Name</th><th>Code</th><th>Section</th><th>Price</th><th>Status</th><th>Visible</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="adm-thumb">
                    {p.imageData && p.imageData.length
                      ? <img src={p.imageData[0]} alt="" />
                      : <div style={{ width:'100%', height:'100%', background:'var(--surface-2)' }} />}
                  </div>
                </td>
                <td style={{ fontWeight:500 }}>{p.name}</td>
                <td style={{ color:'var(--text-dim)', fontFamily:'monospace', fontSize:11 }}>#{p.code}</td>
                <td>{p.section}</td>
                <td style={{ color:'var(--gold)', fontFamily:'var(--font-accent)' }}>₹{p.price.toLocaleString('en-IN')}</td>
                <td>
                  <span className={"adm-badge "+(p.stock_status==='in_stock'?'adm-badge-green':p.stock_status==='out_of_stock'?'adm-badge-gray':'adm-badge-gold')}>
                    {p.stock_status==='in_stock'?'In Stock':p.stock_status==='out_of_stock'?'Out of Stock':'Made to Order'}
                  </span>
                </td>
                <td><AdmToggle value={p.is_visible!==false} onChange={()=>onToggle(p.id, p.is_visible)} /></td>
                <td>
                  <div className="adm-actions">
                    <button className="adm-btn" onClick={()=>onEdit(p)}>Edit</button>
                    <button className="adm-btn adm-btn-danger" onClick={()=>{ if(confirm(`Delete "${p.name}"?`)) onDelete(p.id); }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ─── ProductForm ──────────────────────────────────────────────────────────────
const ProductForm = ({ product, sections, totalProducts, onSave, onCancel }) => {
  const isEdit = !!product;
  const [form, setForm] = React.useState({
    name:         product?.name || '',
    section:      product?.section || (sections[0]?.name || 'Gift Items'),
    short:        product?.short || '',
    long:         product?.long || '',
    instructions: product?.instructions || '',
    price:        product?.price || '',
    badge:        product?.badge || '',
    stock_status: product?.stock_status || 'in_stock',
    is_visible:   product?.is_visible !== false,
    motif:        product?.motif || 'flora',
    palette:      product?.palette || ['#c9a84c','#8c7637','#e8d5a3'],
    // images: array of {type:'existing',data:base64} or {type:'new',file,preview}
    images: (product?.imageData || []).map(data => ({ type:'existing', data })),
  });
  const [saving, setSaving] = React.useState(false);
  const fileRef = React.useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addFiles = async (files) => {
    const remaining = 10 - form.images.length;
    const toProcess = Array.from(files).slice(0, remaining);
    const compressed = await Promise.all(toProcess.map(async f => ({
      type: 'new', data: await compressImage(f),
    })));
    set('images', [...form.images, ...compressed]);
  };

  const removeImg = (i) => set('images', form.images.filter((_,idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())  { alert('Product name is required.'); return; }
    if (!form.section)      { alert('Section is required.'); return; }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) { alert('Valid price is required.'); return; }
    setSaving(true);
    try {
      const imageData = form.images.map(img => img.data);
      onSave({
        name: form.name.trim(),
        section: form.section,
        short: form.short.trim(),
        long: form.long.trim(),
        instructions: form.instructions.trim(),
        price: Number(form.price),
        badge: form.badge.trim() || null,
        stock_status: form.stock_status,
        is_visible: form.is_visible,
        motif: form.motif,
        palette: form.palette,
        imageData,
        code: product?.code || genCode(totalProducts + 1),
      });
    } catch(err) {
      alert('Error saving product: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h2 className="adm-page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          {isEdit && <div className="adm-page-sub">#{product.code}</div>}
        </div>
        <button className="adm-btn" onClick={onCancel}>← Back</button>
      </div>
      <form className="adm-form" onSubmit={handleSubmit}>
        <div className="adm-form-grid">
          <div className="adm-field full">
            <label>Product Name *</label>
            <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Chikankari Tunic" />
          </div>
          <div className="adm-field">
            <label>Section *</label>
            <select value={form.section} onChange={e=>set('section',e.target.value)}>
              {sections.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label>Price (₹) *</label>
            <input type="number" min="1" value={form.price} onChange={e=>set('price',e.target.value)} placeholder="e.g. 1000" />
          </div>
          <div className="adm-field full">
            <label>Short Description <span style={{ textTransform:'none', letterSpacing:0, color:'var(--text-dim)' }}>(shown on card, max 200 chars)</span></label>
            <textarea value={form.short} onChange={e=>set('short',e.target.value)} maxLength={200}
              placeholder="2-3 lines describing the product…" style={{ minHeight:60 }} />
          </div>
          <div className="adm-field full">
            <label>Full Description</label>
            <textarea value={form.long} onChange={e=>set('long',e.target.value)}
              placeholder="Full product story, materials, craftsmanship details…" style={{ minHeight:100 }} />
          </div>
          <div className="adm-field full">
            <label>Care & Special Instructions</label>
            <textarea value={form.instructions} onChange={e=>set('instructions',e.target.value)}
              placeholder="e.g. Cold hand wash. Customisation available." style={{ minHeight:60 }} />
          </div>
          <div className="adm-field">
            <label>Badge <span style={{ textTransform:'none', letterSpacing:0, color:'var(--text-dim)' }}>(optional)</span></label>
            <input value={form.badge} onChange={e=>set('badge',e.target.value)} placeholder="Bestseller / New Arrival / Limited Edition" />
          </div>
          <div className="adm-field">
            <label>Stock Status</label>
            <select value={form.stock_status} onChange={e=>set('stock_status',e.target.value)}>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="made_to_order">Made to Order</option>
            </select>
          </div>
          <div className="adm-field">
            <label>Placeholder Motif <span style={{ textTransform:'none', letterSpacing:0, color:'var(--text-dim)' }}>(if no image)</span></label>
            <select value={form.motif} onChange={e=>set('motif',e.target.value)}>
              {MOTIF_OPTS.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
            </select>
          </div>
          <div className="adm-field">
            <label>Placeholder Palette</label>
            <select value={JSON.stringify(form.palette)} onChange={e=>set('palette',JSON.parse(e.target.value))}>
              {PALETTE_PRESETS.map(pp => (
                <option key={pp.name} value={JSON.stringify(pp.val)}>{pp.name}</option>
              ))}
            </select>
          </div>
          <div className="adm-field full">
            <label>Visibility</label>
            <AdmToggle value={form.is_visible} onChange={v=>set('is_visible',v)}
              label={form.is_visible ? 'Visible on storefront' : 'Hidden from storefront'} />
          </div>
        </div>

        <hr className="adm-divider" />

        <div className="adm-field">
          <label>Product Images <span style={{ textTransform:'none', letterSpacing:0, color:'var(--text-dim)' }}>(max 10 · first = cover · stored in Firebase Storage)</span></label>
          <div className="adm-upload-zone"
            onClick={() => fileRef.current && fileRef.current.click()}
            onDrop={e => { e.preventDefault(); if(e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}
            onDragOver={e => e.preventDefault()}>
            <p>Drag & drop images here, or click to browse</p>
            <small>JPG, PNG, WebP · Up to {10 - form.images.length} more</small>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
            multiple style={{ display:'none' }}
            onChange={e => { if(e.target.files.length) addFiles(e.target.files); e.target.value=''; }} />
          {form.images.length > 0 && (
            <div className="adm-img-previews">
              {form.images.map((img, i) => (
                <div key={i} className="adm-img-preview">
                  <img src={img.data} alt="" />
                  {i === 0 && <div className="adm-img-cover">Cover</div>}
                  <button type="button" onClick={() => removeImg(i)}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr className="adm-divider" />

        <div style={{ display:'flex', gap:12 }}>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Add Product')}
          </button>
          <button type="button" className="adm-btn" onClick={onCancel} disabled={saving}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

// ─── SectionsManager ──────────────────────────────────────────────────────────
const SectionsManager = ({ sections, onAdd, onRename, onDelete }) => {
  const [editing, setEditing] = React.useState(null);
  const [name, setName]       = React.useState('');

  const startAdd  = () => { setName(''); setEditing('new'); };
  const startEdit = (s) => { setName(s.name); setEditing(s.id); };

  const save = () => {
    if (!name.trim()) { alert('Section name is required.'); return; }
    if (editing === 'new') onAdd(name.trim());
    else onRename(editing, name.trim());
    setEditing(null);
  };

  if (editing !== null) return (
    <div>
      <div className="adm-page-head">
        <h2 className="adm-page-title">{editing==='new'?'Add Section':'Edit Section'}</h2>
        <button className="adm-btn" onClick={()=>setEditing(null)}>← Back</button>
      </div>
      <div className="adm-form" style={{ maxWidth:420 }}>
        <div className="adm-field">
          <label>Section Name *</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Jewellery" autoFocus
            onKeyDown={e => e.key==='Enter' && save()} />
        </div>
        <div style={{ display:'flex', gap:12, marginTop:20 }}>
          <button className="adm-btn adm-btn-primary" onClick={save}>{editing==='new'?'Add':'Save'}</button>
          <button className="adm-btn" onClick={()=>setEditing(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h2 className="adm-page-title">Sections</h2>
          <div className="adm-page-sub">Product categories shown in the storefront filter tabs</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={startAdd}>+ Add Section</button>
      </div>
      <table className="adm-table">
        <thead><tr><th>#</th><th>Section Name</th><th>Actions</th></tr></thead>
        <tbody>
          {sections.map((s,i) => (
            <tr key={s.id}>
              <td style={{ color:'var(--text-dim)', width:40 }}>{i+1}</td>
              <td style={{ fontWeight:500 }}>{s.name}</td>
              <td>
                <div className="adm-actions">
                  <button className="adm-btn" onClick={()=>startEdit(s)}>Rename</button>
                  <button className="adm-btn adm-btn-danger" onClick={()=>{ if(confirm('Delete this section?')) onDelete(s.id); }}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── OffersManager ────────────────────────────────────────────────────────────
const OffersManager = ({ offers, products, onSave, onDelete, onToggle }) => {
  const [editing, setEditing] = React.useState(null);
  const [form, setForm]       = React.useState({});
  const [ddOpen, setDdOpen]   = React.useState(false);

  const blank = { name:'', desc:'', badge:'', productIds:[], wasPrice:'', nowPrice:'', is_visible:true };
  const startAdd  = () => { setForm(blank); setEditing('new'); };
  const startEdit = (o) => { setForm({ ...o, wasPrice:String(o.wasPrice||0), nowPrice:String(o.nowPrice||0) }); setEditing(o.id); };
  const fset = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const calcWas = (ids) => ids.reduce((sum,id) => {
    const p = products.find(x=>x.id===id); return sum+(p?p.price:0);
  }, 0);

  const togglePid = (pid) => {
    const ids = form.productIds||[];
    const prev = calcWas(ids);
    const next = ids.includes(pid) ? ids.filter(i=>i!==pid) : [...ids, pid];
    fset('productIds', next);
    if (!form.wasPrice || form.wasPrice===String(prev)) {
      const was = calcWas(next);
      fset('wasPrice', String(was));
      if (!form.nowPrice) fset('nowPrice', String(Math.floor(was*0.9)));
    }
  };

  const save = () => {
    if (!form.name.trim())     { alert('Offer name required.'); return; }
    if (!form.productIds.length) { alert('Select at least one product.'); return; }
    const data = { ...form, wasPrice:Number(form.wasPrice)||0, nowPrice:Number(form.nowPrice)||0 };
    onSave(editing==='new' ? null : editing, data);
    setEditing(null);
  };

  if (editing !== null) {
    const chosen    = (form.productIds||[]).map(id=>products.find(p=>p.id===id)).filter(Boolean);
    const available = products.filter(p=>!(form.productIds||[]).includes(p.id));
    return (
      <div>
        <div className="adm-page-head">
          <h2 className="adm-page-title">{editing==='new'?'Add Offer':'Edit Offer'}</h2>
          <button className="adm-btn" onClick={()=>setEditing(null)}>← Back</button>
        </div>
        <div className="adm-form">
          <div className="adm-form-grid">
            <div className="adm-field full">
              <label>Offer Name *</label>
              <input value={form.name||''} onChange={e=>fset('name',e.target.value)} placeholder="e.g. Diwali Heritage Bundle" />
            </div>
            <div className="adm-field full">
              <label>Description</label>
              <textarea value={form.desc||''} onChange={e=>fset('desc',e.target.value)} style={{ minHeight:60 }} />
            </div>
            <div className="adm-field">
              <label>Badge <span style={{ textTransform:'none', letterSpacing:0, color:'var(--text-dim)' }}>(optional)</span></label>
              <input value={form.badge||''} onChange={e=>fset('badge',e.target.value)} placeholder="Save ₹500 / Bundle Deal" />
            </div>
            <div className="adm-field">
              <label>Visibility</label>
              <AdmToggle value={form.is_visible!==false} onChange={v=>fset('is_visible',v)} label={form.is_visible!==false?'Visible':'Hidden'} />
            </div>
            <div className="adm-field full" style={{ position:'relative' }}>
              <label>Products in this offer *</label>
              <div className="adm-multiselect">
                {chosen.map(p => (
                  <span key={p.id} className="adm-ms-chip">
                    {p.name} <button type="button" onClick={()=>togglePid(p.id)}>×</button>
                  </span>
                ))}
                {available.length > 0 && (
                  <button type="button" className="adm-ms-add" onClick={()=>setDdOpen(o=>!o)}>+ Add product</button>
                )}
              </div>
              {ddOpen && (
                <div className="adm-ms-dropdown">
                  {available.map(p => (
                    <div key={p.id} className="adm-ms-opt" onClick={()=>{ togglePid(p.id); setDdOpen(false); }}>
                      {p.name} — ₹{p.price.toLocaleString('en-IN')}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="adm-field">
              <label>Original Price (₹)</label>
              <input type="number" value={form.wasPrice||''} onChange={e=>fset('wasPrice',e.target.value)} />
              <div className="adm-field-hint">Auto-calculated from products. You can override.</div>
            </div>
            <div className="adm-field">
              <label>Offer Price (₹)</label>
              <input type="number" value={form.nowPrice||''} onChange={e=>fset('nowPrice',e.target.value)} />
            </div>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:24 }}>
            <button className="adm-btn adm-btn-primary" onClick={save}>{editing==='new'?'Add Offer':'Save Changes'}</button>
            <button className="adm-btn" onClick={()=>setEditing(null)}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="adm-page-head">
        <div>
          <h2 className="adm-page-title">Offers</h2>
          <div className="adm-page-sub">Bundle deals shown in the Offers section</div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={startAdd}>+ Add Offer</button>
      </div>
      {offers.length === 0 ? (
        <div style={{ padding:'40px 0', textAlign:'center', color:'var(--text-dim)' }}>No offers yet.</div>
      ) : (
        <table className="adm-table">
          <thead><tr><th>Name</th><th>Products</th><th>Was</th><th>Now</th><th>Visible</th><th>Actions</th></tr></thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id}>
                <td style={{ fontWeight:500 }}>{o.name} {o.badge && <span className="adm-badge adm-badge-gold" style={{ marginLeft:8 }}>{o.badge}</span>}</td>
                <td style={{ color:'var(--text-dim)', fontSize:12 }}>
                  {(o.productIds||[]).map(id=>products.find(p=>p.id===id)?.name||'?').join(', ')}
                </td>
                <td style={{ textDecoration:'line-through', color:'var(--text-dim)' }}>₹{(o.wasPrice||0).toLocaleString('en-IN')}</td>
                <td style={{ color:'var(--gold)', fontFamily:'var(--font-accent)' }}>₹{(o.nowPrice||0).toLocaleString('en-IN')}</td>
                <td><AdmToggle value={o.is_visible!==false} onChange={()=>onToggle(o.id, o.is_visible)} /></td>
                <td>
                  <div className="adm-actions">
                    <button className="adm-btn" onClick={()=>startEdit(o)}>Edit</button>
                    <button className="adm-btn adm-btn-danger" onClick={()=>{ if(confirm('Delete this offer?')) onDelete(o.id); }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ─── SiteSettings ─────────────────────────────────────────────────────────────
const SiteSettings = ({ settings, onSave }) => {
  const [f, setF]       = React.useState({ ...settings });
  const [saved, setSaved] = React.useState(false);
  const set = (k,v) => setF(s=>({ ...s, [k]:v }));
  const save = async (e) => {
    e.preventDefault();
    await onSave(f);
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };
  return (
    <div>
      <div className="adm-page-head"><h2 className="adm-page-title">Site Settings</h2></div>
      <form className="adm-form" onSubmit={save}>
        <div style={{ fontSize:12, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:12 }}>Contact & Social</div>
        <div className="adm-form-grid">
          <div className="adm-field"><label>Business Phone</label><input value={f.phone} onChange={e=>set('phone',e.target.value)} /></div>
          <div className="adm-field"><label>WhatsApp Number <span style={{ textTransform:'none', letterSpacing:0 }}>(digits only)</span></label><input value={f.whatsapp} onChange={e=>set('whatsapp',e.target.value)} /></div>
          <div className="adm-field"><label>Instagram Handle</label><input value={f.instagram} onChange={e=>set('instagram',e.target.value)} /></div>
          <div className="adm-field"><label>Email</label><input type="email" value={f.email} onChange={e=>set('email',e.target.value)} /></div>
          <div className="adm-field"><label>Facebook URL</label><input value={f.facebook} onChange={e=>set('facebook',e.target.value)} /></div>
          <div className="adm-field"><label>Twitter / X URL</label><input value={f.twitter} onChange={e=>set('twitter',e.target.value)} /></div>
          <div className="adm-field"><label>GST Number</label><input value={f.gst} onChange={e=>set('gst',e.target.value)} /></div>
        </div>
        <hr className="adm-divider" />
        <div style={{ fontSize:12, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:12 }}>Hero Section</div>
        <div className="adm-form-grid">
          <div className="adm-field full"><label>Headline</label><input value={f.heroHeadline} onChange={e=>set('heroHeadline',e.target.value)} /></div>
          <div className="adm-field full"><label>Subheadline</label><textarea value={f.heroSub} onChange={e=>set('heroSub',e.target.value)} style={{ minHeight:60 }} /></div>
        </div>
        <hr className="adm-divider" />
        <div style={{ fontSize:12, letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:12 }}>SEO</div>
        <div className="adm-form-grid">
          <div className="adm-field full"><label>Site Title</label><input value={f.siteTitle} onChange={e=>set('siteTitle',e.target.value)} /></div>
          <div className="adm-field full"><label>Meta Description</label><textarea value={f.metaDesc} onChange={e=>set('metaDesc',e.target.value)} style={{ minHeight:60 }} /></div>
          <div className="adm-field full"><label>Keywords</label><input value={f.metaKeywords} onChange={e=>set('metaKeywords',e.target.value)} /></div>
        </div>
        <hr className="adm-divider" />
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button type="submit" className="adm-btn adm-btn-primary">Save Settings</button>
          {saved && <span style={{ color:'#7CA982', fontSize:13 }}>✓ Saved</span>}
        </div>
      </form>
    </div>
  );
};

// ─── AdminApp ─────────────────────────────────────────────────────────────────
const AdminApp = () => {
  const [authed,      setAuthed]      = React.useState(false);
  const [loading,     setLoading]     = React.useState(true);
  const [page,        setPage]        = React.useState('overview');
  const [editProduct, setEditProduct] = React.useState(null);
  const [products,    setProducts]    = React.useState([]);
  const [sections,    setSections]    = React.useState([]);
  const [offers,      setOffers]      = React.useState([]);
  const [settings,    setSettings]    = React.useState(DEFAULT_SETTINGS);

  const loadAll = React.useCallback(async () => {
    const [prodSnap, secSnap, offSnap, settingsDoc] = await Promise.all([
      fdb().collection('products').orderBy('display_order').get(),
      fdb().collection('sections').orderBy('display_order').get(),
      fdb().collection('offers').get(),
      fdb().collection('settings').doc('site').get(),
    ]);
    const prods = prodSnap.docs.map(d => ({ ...d.data(), id: d.id }));
    setProducts(prods);
    setSections(secSnap.docs.map(d => ({ ...d.data(), id: d.id })));
    setOffers(offSnap.docs.map(d => ({ ...d.data(), id: d.id })));
    setSettings({ ...DEFAULT_SETTINGS, ...(settingsDoc.exists ? settingsDoc.data() : {}) });
    // Seed defaults if first run
    if (prods.length === 0 && window.PRODUCTS && window.PRODUCTS.length > 0) {
      const batch = fdb().batch();
      window.PRODUCTS.forEach((p, i) => {
        const ref = fdb().collection('products').doc();
        batch.set(ref, {
          code: p.code, name: p.name, section: p.section,
          short: p.short||'', long: p.long||'', instructions: p.instructions||'',
          price: p.price, badge: p.badge||null,
          palette: p.palette||['#c9a84c','#8c7637','#e8d5a3'],
          motif: p.motif||'flora', imageData: [],
          stock_status:'in_stock', is_visible:true, display_order: i,
        });
      });
      const defaultSections = [
        {name:'Gift Items',display_order:0},{name:'Apparel',display_order:1},
        {name:'Hampers',display_order:2},{name:'Decor',display_order:3},{name:'Fragrance',display_order:4},
      ];
      defaultSections.forEach(s => {
        const ref = fdb().collection('sections').doc();
        batch.set(ref, s);
      });
      await batch.commit();
      // Reload after seeding
      const [p2, s2] = await Promise.all([
        fdb().collection('products').orderBy('display_order').get(),
        fdb().collection('sections').orderBy('display_order').get(),
      ]);
      setProducts(p2.docs.map(d => ({ ...d.data(), id: d.id })));
      setSections(s2.docs.map(d => ({ ...d.data(), id: d.id })));
    }
  }, []);

  React.useEffect(() => {
    const ok = localStorage.getItem(AC_AUTH_KEY) === 'ok';
    setAuthed(ok);
    if (ok) {
      loadAll().catch(console.error).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadAll]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0D0D0D' }}>
      <AdmSpinner />
    </div>
  );
  if (!authed) return <AdminLogin onLogin={() => { setAuthed(true); loadAll().catch(console.error).finally(() => setLoading(false)); }} />;

  // ── Firestore write helpers ──
  const saveProduct = async (formData) => {
    const isNew = !editProduct || editProduct._isNew;
    if (isNew) {
      await fdb().collection('products').add({ ...formData, display_order: products.length });
    } else {
      await fdb().collection('products').doc(editProduct.id).update(formData);
    }
    await loadAll();
    setEditProduct(null);
    setPage('products');
  };

  const deleteProduct = async (docId) => {
    await fdb().collection('products').doc(docId).delete();
    await loadAll();
  };

  const toggleProduct = async (docId, currentVisible) => {
    await fdb().collection('products').doc(docId).update({ is_visible: currentVisible === false });
    await loadAll();
  };

  const addSection = async (name) => {
    await fdb().collection('sections').add({ name, display_order: sections.length });
    await loadAll();
  };

  const renameSection = async (docId, name) => {
    await fdb().collection('sections').doc(docId).update({ name });
    await loadAll();
  };

  const deleteSection = async (docId) => {
    await fdb().collection('sections').doc(docId).delete();
    await loadAll();
  };

  const saveOffer = async (docId, data) => {
    if (!docId) await fdb().collection('offers').add(data);
    else await fdb().collection('offers').doc(docId).update(data);
    await loadAll();
  };

  const deleteOffer = async (docId) => {
    await fdb().collection('offers').doc(docId).delete();
    await loadAll();
  };

  const toggleOffer = async (docId, currentVisible) => {
    await fdb().collection('offers').doc(docId).update({ is_visible: currentVisible === false });
    await loadAll();
  };

  const saveSettings = async (data) => {
    await fdb().collection('settings').doc('site').set(data, { merge: true });
    setSettings(data);
  };

  const logout = () => { localStorage.removeItem(AC_AUTH_KEY); setAuthed(false); };

  const nav = [
    { id:'overview', label:'Dashboard' },
    { id:'products', label:'Products'  },
    { id:'sections', label:'Sections'  },
    { id:'offers',   label:'Offers'    },
    { id:'settings', label:'Site Settings' },
  ];

  return (
    <div className="admin-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <h2>Aman <em>Creations</em></h2>
          <small>Admin Panel</small>
        </div>
        <nav className="adm-nav">
          {nav.map(n => (
            <button key={n.id} className={"adm-nav-item "+(page===n.id&&!editProduct?'active':'')}
              onClick={()=>{ setPage(n.id); setEditProduct(null); }}>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <div className="adm-sf-link" onClick={()=>{ window.location.hash=''; }}>← View Storefront</div>
          <button className="adm-btn adm-btn-danger" style={{ marginTop:10, width:'100%', justifyContent:'center' }}
            onClick={logout}>Logout</button>
        </div>
      </aside>

      <div className="adm-main">
        <div className="adm-topbar">
          <div className="adm-topbar-title">
            {editProduct ? (editProduct._isNew?'New Product':'Edit Product') : nav.find(n=>n.id===page)?.label}
          </div>
          <div style={{ fontSize:12, color:'var(--text-dim)' }}>Aman Creations Admin</div>
        </div>
        <div className="adm-content">
          {page==='overview' && <AdminOverview products={products} sections={sections} offers={offers} />}
          {page==='products' && !editProduct && (
            <ProductsList
              products={products} sections={sections}
              onEdit={p=>setEditProduct(p)}
              onDelete={deleteProduct}
              onToggle={toggleProduct}
              onAdd={()=>setEditProduct({ _isNew:true })}
            />
          )}
          {page==='products' && editProduct && (
            <ProductForm
              product={editProduct._isNew ? null : editProduct}
              sections={sections}
              totalProducts={products.length}
              onSave={saveProduct}
              onCancel={()=>setEditProduct(null)}
            />
          )}
          {page==='sections' && (
            <SectionsManager sections={sections} onAdd={addSection} onRename={renameSection} onDelete={deleteSection} />
          )}
          {page==='offers' && (
            <OffersManager offers={offers} products={products} onSave={saveOffer} onDelete={deleteOffer} onToggle={toggleOffer} />
          )}
          {page==='settings' && (
            <SiteSettings settings={settings} onSave={saveSettings} />
          )}
        </div>
      </div>
    </div>
  );
};

window.AdminApp = AdminApp;
