import React, { useEffect, useMemo, useState } from "react";

// Cocoacrest — Frontend-only product showcase
// - Orders are handled via Instagram DM (profile opens and a pre-filled message is copied to clipboard)
// - Admin mode (toggle) allows adding/removing chocolates (stored in localStorage)
// - Responsive header with a compact mobile layout
// - TailwindCSS utility classes used throughout

export default function CocoacrestShowcase() {
  const STORAGE_KEY = "cocoacrest_products_v1";

  const defaultProducts = [
    {
      id: "choc-01",
      name: "Midnight Truffle",
      desc: "70% dark chocolate ganache with a whisper of sea salt.",
      price: 4.5,
      category: "Dark",
      color: "#3b2f2f",
    },
    {
      id: "choc-02",
      name: "Silky Caramel",
      desc: "Smooth caramel center, milk chocolate coating.",
      price: 3.9,
      category: "Milk",
      color: "#8b5e3c",
    },
    {
      id: "choc-03",
      name: "Hazelnut Crunch",
      desc: "Toasted hazelnuts with crunchy pearls.",
      price: 5.25,
      category: "Nutty",
      color: "#6b3f1f",
    },
    {
      id: "choc-04",
      name: "Ruby Raspberry",
      desc: "Tangy raspberry cream wrapped in ruby chocolate.",
      price: 5.0,
      category: "Fruit",
      color: "#b33a5b",
    },
    {
      id: "choc-05",
      name: "Matcha Bliss",
      desc: "White chocolate meets premium matcha powder.",
      price: 4.75,
      category: "Exotic",
      color: "#6b8b4b",
    },
    {
      id: "choc-06",
      name: "Cocoa Crunch Bar",
      desc: "Crispy rice, cacao nibs and a milk chocolate hug.",
      price: 2.95,
      category: "Bar",
      color: "#6d3b2b",
    },
  ];

  // Products state (persisted to localStorage) -------------------------------------------------
  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProducts;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return defaultProducts;
      return parsed;
    } catch (e) {
      return defaultProducts;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.warn("Failed to save products", e);
    }
  }, [products]);

  // UI state -----------------------------------------------------------------------------------
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Admin controls -----------------------------------------------------------------------------
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState("");

  // Add product form state
  const [newProduct, setNewProduct] = useState({ name: "", desc: "", price: "", category: "", color: "#7b3e23" });

  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);

  // Filtering ----------------------------------------------------------------------------------
  const filtered = products.filter((p) => {
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    const q = (p.name + p.desc + p.category).toLowerCase();
    const matchesSearch = q.includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Helpers: SVG image generator -----------------------------------------------------------------
  const svgBlob = (label, color) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='480'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='${color}' stop-opacity='1'/><stop offset='1' stop-color='#111111' stop-opacity='0.9'/></linearGradient></defs><rect width='100%' height='100%' rx='28' fill='url(#g)'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='rgba(255,255,255,0.95)' font-family='Inter, Arial' font-size='36'>${label}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // Admin actions --------------------------------------------------------------------------------
  function addProduct(e) {
    e.preventDefault();
    if (!newProduct.name.trim()) return alert("Please add a product name.");
    const p = {
      id: "choc-" + Date.now(),
      name: newProduct.name.trim(),
      desc: newProduct.desc.trim(),
      price: parseFloat(newProduct.price) || 0,
      category: newProduct.category.trim() || "General",
      color: newProduct.color || "#6b3f1f",
    };
    setProducts((s) => [p, ...s]);
    setNewProduct({ name: "", desc: "", price: "", category: "", color: "#7b3e23" });
  }

  function removeProduct(id) {
    if (!confirm("Remove this chocolate?")) return;
    setProducts((s) => s.filter((p) => p.id !== id));
  }

  // Admin login (very lightweight): toggles admin mode if passphrase is exact 'cocoacrest-admin'
  function handleAdminToggle() {
    if (isAdmin) return setIsAdmin(false);
    if (adminPass === "cocoacrest-admin") {
      setIsAdmin(true);
      setAdminPass("");
    } else {
      alert("Enter correct admin passphrase to enable admin controls.");
    }
  }

  // Order via Instagram: copies a pre-filled message and opens profile --------------------------------
  const INSTAGRAM_PROFILE = "https://www.instagram.com/cocoacrest/"; // provided by user

  async function orderOnInstagram(product) {
    const message = `Hi Cocoacrest! I'd like to order: ${product.name} (₹${product.price.toFixed(2)}) — please let me know availability and delivery details.`;
    try {
      await navigator.clipboard.writeText(message);
      // open instagram profile in new tab
      window.open(INSTAGRAM_PROFILE, "_blank");
      alert("A pre-filled message was copied to your clipboard. Open the profile and paste it in a DM to place your order.");
    } catch (e) {
      // fallback: still open profile and show message in prompt so user can copy manually
      window.open(INSTAGRAM_PROFILE, "_blank");
      prompt("Copy this message and send it in Instagram DM:", message);
    }
  }

  // Small accessibility helper for keyboard users
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") {
        setSelected(null);
        setMobileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-rose-50 text-gray-900">
      {/* RESPONSIVE HEADER */}
      <header className="sticky top-0 z-40 bg-white/75 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setMobileMenuOpen((s) => !s)} aria-label="menu">
              {/* hamburger */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <a href="#" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-amber-700 shadow-md flex items-center justify-center text-xl font-extrabold text-brown-900" style={{ color: '#3b2f2f' }}>
                C
              </div>
              <div className="hidden sm:block">
                <div className="font-extrabold text-lg">Cocoacrest</div>
                <div className="text-xs text-gray-600">Pure joy — one bite at a time</div>
              </div>
            </a>
          </div>

          {/* center search (collapses on very small screens) */}
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chocolates, flavors or categories..."
                className="w-full rounded-full border border-transparent shadow-sm py-2 px-4 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 text-white px-3 py-1 rounded-full shadow hidden sm:inline">Search</button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href={INSTAGRAM_PROFILE} target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500 text-white shadow">Follow on Instagram</a>

            <div className="flex items-center gap-2">
              <input
                aria-label="admin pass"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Admin pass"
                className="inline-block px-3 py-1 rounded border text-sm"
              />
              <button
                onClick={handleAdminToggle}
                className={`px-3 py-1 rounded-full ${isAdmin ? 'bg-amber-600 text-white' : 'bg-white border'}`}
                title="Toggle admin mode (passphrase required)"
              >
                {isAdmin ? 'Admin' : 'Enter Admin'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile categories drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/90">
            <div className="px-4 py-3 flex gap-2 overflow-auto">
              {categories.map((c) => (
                <button key={c} onClick={() => { setActiveCategory(c); setMobileMenuOpen(false); }} className={`whitespace-nowrap px-3 py-1 rounded-full ${activeCategory === c ? 'bg-amber-500 text-white' : 'bg-white/80 border'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-stretch">
          <div className="md:col-span-2 rounded-2xl p-6 bg-gradient-to-br from-amber-100 to-amber-50 shadow-lg flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-brown-900">Cocoacrest — handcrafted chocolates</h1>
            <p className="mt-3 text-gray-700 max-w-xl">Browse our curated chocolates. To place an order, click <strong>Order on Instagram</strong> for the chocolate you like — we'll receive your DM directly.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => { setActiveCategory('All'); window.scrollTo({ top: 700, behavior: 'smooth' }); }} className="px-4 py-2 rounded-full bg-rose-500 text-white shadow">Explore all</button>
              <button onClick={() => { setActiveCategory('Dark'); window.scrollTo({ top: 700, behavior: 'smooth' }); }} className="px-4 py-2 rounded-full bg-amber-200 hover:bg-amber-300">Dark Picks</button>
            </div>
          </div>

          <aside className="rounded-2xl p-4 bg-white shadow-lg flex flex-col gap-3">
            <div className="font-bold">Today’s Highlights</div>
            <div className="flex-1 grid grid-cols-1 gap-3">
              <div className="rounded-lg p-3 bg-gradient-to-r from-amber-50 to-rose-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-amber-200 flex items-center justify-center">🔥</div>
                  <div>
                    <div className="font-semibold">Limited edition</div>
                    <div className="text-xs text-gray-600">Try our seasonal blends</div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-3 bg-gradient-to-r from-white to-amber-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-rose-100 flex items-center justify-center">🎁</div>
                  <div>
                    <div className="font-semibold">Custom gift boxes</div>
                    <div className="text-xs text-gray-600">DM us on Instagram to request gift wrapping</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* category chips (desktop) */}
        <div className="mb-4 hidden md:block">
          <div className="flex gap-3 overflow-auto pb-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setActiveCategory(c)} className={`whitespace-nowrap px-4 py-2 rounded-full ${activeCategory === c ? 'bg-amber-500 text-white' : 'bg-white/80 border'} shadow-sm`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <article key={p.id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden">
              <div className="p-4">
                <img src={svgBlob(p.name, p.color)} alt={p.name} className="w-full h-44 object-cover rounded-lg" />
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{p.name}</h3>
                    <p className="text-xs text-gray-600">{p.desc}</p>
                    <div className="mt-2 text-amber-600 font-bold">₹{(p.price * 90).toFixed(0)} <span className="text-xs text-gray-500 font-medium">(₹{p.price.toFixed(2)})</span></div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <button onClick={() => setSelected(p)} className="text-sm px-3 py-1 rounded-full border">Details</button>
                    <button onClick={() => orderOnInstagram(p)} className="px-3 py-1 rounded-full bg-rose-500 text-white shadow">Order on Instagram</button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="mt-8 text-center text-gray-600">No chocolates match your search. Try clearing filters.</div>
        )}

        <footer className="mt-12 mb-8 text-center text-sm text-gray-600">Made with ❤️ by Cocoacrest — product showcase</footer>
      </main>

      {/* Product Details Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <img src={svgBlob(selected.name, selected.color)} alt={selected.name} className="w-full h-64 object-cover rounded-lg" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold">{selected.name}</h2>
                <p className="mt-2 text-gray-700">{selected.desc}</p>
                <div className="mt-4 text-amber-600 font-bold">₹{(selected.price * 90).toFixed(0)}</div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => orderOnInstagram(selected)} className="px-4 py-2 rounded-full bg-rose-500 text-white">Order on Instagram</button>
                  <button onClick={() => setSelected(null)} className="px-4 py-2 rounded-full border">Close</button>
                </div>

                {isAdmin && (
                  <div className="mt-6">
                    <button onClick={() => removeProduct(selected.id)} className="text-sm text-rose-500">Remove this chocolate</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin panel (bottom-right floating) */}
      {isAdmin && (
        <div className="fixed right-4 bottom-4 z-50 w-full max-w-md p-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 border">
            <div className="flex items-center justify-between">
              <div className="font-bold">Admin — Manage Chocolates</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsAdmin(false)} className="px-3 py-1 rounded-full border">Exit</button>
              </div>
            </div>

            <form onSubmit={addProduct} className="mt-3 grid gap-2">
              <input value={newProduct.name} onChange={(e) => setNewProduct((s) => ({ ...s, name: e.target.value }))} placeholder="Name" className="px-3 py-2 rounded border" />
              <input value={newProduct.desc} onChange={(e) => setNewProduct((s) => ({ ...s, desc: e.target.value }))} placeholder="Short description" className="px-3 py-2 rounded border" />
              <div className="grid grid-cols-2 gap-2">
                <input value={newProduct.price} onChange={(e) => setNewProduct((s) => ({ ...s, price: e.target.value }))} placeholder="Price (USD)" className="px-3 py-2 rounded border" />
                <input value={newProduct.category} onChange={(e) => setNewProduct((s) => ({ ...s, category: e.target.value }))} placeholder="Category" className="px-3 py-2 rounded border" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">Color</label>
                <input type="color" value={newProduct.color} onChange={(e) => setNewProduct((s) => ({ ...s, color: e.target.value }))} className="w-12 h-8 p-0 border rounded" />
                <button type="submit" className="ml-auto px-3 py-1 rounded-full bg-amber-600 text-white">Add chocolate</button>
              </div>

              <div className="mt-3">
                <div className="text-sm font-semibold">Existing chocolates</div>
                <div className="max-h-48 overflow-auto mt-2 divide-y">
                  {products.map((p) => (
                    <div key={p.id} className="py-2 flex items-center gap-2">
                      <img src={svgBlob(p.name, p.color)} alt={p.name} className="w-12 h-8 rounded-md object-cover" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.category} • ₹{(p.price * 90).toFixed(0)}</div>
                      </div>
                      <button onClick={() => removeProduct(p.id)} className="text-sm text-rose-500">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}