document.addEventListener('DOMContentLoaded', () => {
  const products = [
    {
      id: 101,
      name: 'Klang Desk Monolith',
      category: 'Audio',
      material: 'Anodized Aluminum',
      price: 420,
      image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      desc: 'Directional tabletop acoustic speaker milled from a single block of bead-blasted aluminum.'
    },
    {
      id: 102,
      name: 'Solis Glass Lamp',
      category: 'Lighting',
      material: 'Borosilicate & Brass',
      price: 290,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
      desc: 'Warm 2400K ambient luminaire with stepless rotary brass dimmer.'
    },
    {
      id: 103,
      name: 'Takt Mechanical Task Tray',
      category: 'Workspace',
      material: 'Smoked Oak & Steel',
      price: 165,
      image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=800&q=80',
      desc: 'Modular desk organizer engineered to align stationery and architectural instruments.'
    },
    {
      id: 104,
      name: 'Aether Studio Headphones',
      category: 'Audio',
      material: 'Lambskin & Titanium',
      price: 540,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      desc: 'Open-back planar magnetic reference headphones with zero-clamp suspension.'
    },
    {
      id: 105,
      name: 'Lumen Cantilever Arm',
      category: 'Lighting',
      material: 'Matte Graphite Steel',
      price: 340,
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
      desc: 'Counterbalanced drafting lamp with high-CRI museum-grade LED array.'
    },
    {
      id: 106,
      name: 'Chrono Desk Chronograph',
      category: 'Workspace',
      material: 'Brushed Stainless Steel',
      price: 210,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      desc: 'Silent sweep quartz desk instrument inspired by 1960s Swiss station clocks.'
    }
  ];

  let cart = JSON.parse(localStorage.getItem('velo_cart')) || [];
  let wishlist = JSON.parse(localStorage.getItem('velo_wishlist')) || [];
  let activeCategory = 'all';
  let discountRate = 0;

  const grid = document.getElementById('productGrid');

  function saveState() {
    localStorage.setItem('velo_cart', JSON.stringify(cart));
    localStorage.setItem('velo_wishlist', JSON.stringify(wishlist));
    updateBadges();
  }

  function updateBadges() {
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').textContent = totalQty;
    document.getElementById('wishCount').textContent = wishlist.length;
  }

  function renderCatalog() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortSelect').value;

    let list = products.filter(p => {
      const catMatch = activeCategory === 'all' || p.category === activeCategory;
      const textMatch = p.name.toLowerCase().includes(query) || p.material.toLowerCase().includes(query);
      return catMatch && textMatch;
    });

    if (sortBy === 'asc') list.sort((a, b) => a.price - b.price);
    if (sortBy === 'desc') list.sort((a, b) => b.price - a.price);

    grid.innerHTML = list.map(p => {
      const isSaved = wishlist.includes(p.id);
      return `
        <article class="product-card">
          <div class="card-media" onclick="openDetail(${p.id})">
            <img src="${p.image}" alt="${p.name}" loading="lazy" />
            <button class="wish-icon ${isSaved ? 'saved' : ''}" onclick="event.stopPropagation(); toggleWish(${p.id})">
              ${isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
          <div class="card-meta">
            <h3 class="card-title" onclick="openDetail(${p.id})">${p.name}</h3>
            <span class="card-price">$${p.price}</span>
          </div>
          <p class="card-sub">${p.category} — ${p.material}</p>
          <button class="add-bag-btn" onclick="addToCart(${p.id})">Add to Bag</button>
        </article>
      `;
    }).join('');
  }

  window.addToCart = (id) => {
    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, qty: 1 });
    saveState();
    renderCart();
    document.getElementById('cartDrawer').classList.add('open');
  };

  window.updateQty = (id, delta) => {
    cart = cart.map(item => item.id === id ? { ...item, qty: item.qty + delta } : item)
               .filter(item => item.qty > 0);
    saveState();
    renderCart();
  };

  window.toggleWish = (id) => {
    if (wishlist.includes(id)) wishlist = wishlist.filter(w => w !== id);
    else wishlist.push(id);
    saveState();
    renderCatalog();
    renderWishlist();
  };

  window.openDetail = (id) => {
    const p = products.find(item => item.id === id);
    document.getElementById('detailBody').innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div class="detail-info">
        <span class="eyebrow">${p.category}</span>
        <h2>${p.name}</h2>
        <p class="card-price" style="font-size:1.2rem;">$${p.price} USD</p>
        <div class="detail-specs">
          <p><strong>Material:</strong> ${p.material}</p>
          <p style="margin-top:0.5rem;">${p.desc}</p>
        </div>
        <button class="checkout-btn" onclick="addToCart(${p.id}); document.getElementById('detailModal').classList.remove('open');">
          Acquire Object — $${p.price}
        </button>
      </div>
    `;
    document.getElementById('detailModal').classList.add('open');
  };

  function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    if (!cart.length) {
      container.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;">Your acquisition bag is empty.</p>';
    } else {
      container.innerHTML = cart.map(item => {
        const p = products.find(prod => prod.id === item.id);
        return `
          <div class="cart-item">
            <img src="${p.image}" alt="${p.name}" />
            <div style="flex:1;">
              <strong>${p.name}</strong>
              <div style="font-size:0.82rem;color:var(--muted);">$${p.price} each</div>
              <div class="qty-controls">
                <button class="qty-btn" onclick="updateQty(${p.id}, -1)">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" onclick="updateQty(${p.id}, 1)">+</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    const subtotal = cart.reduce((sum, item) => {
      const p = products.find(prod => prod.id === item.id);
      return sum + (p.price * item.qty);
    }, 0);
    const discount = Math.round(subtotal * discountRate);
    const total = subtotal - discount;

    document.getElementById('subtotalVal').textContent = `$${subtotal}`;
    document.getElementById('discountVal').textContent = `-$${discount}`;
    document.getElementById('totalVal').textContent = `$${total}`;
  }

  function renderWishlist() {
    const container = document.getElementById('wishlistContainer');
    if (!wishlist.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:1rem 0;">No objects saved yet.</p>';
      return;
    }
    container.innerHTML = wishlist.map(id => {
      const p = products.find(prod => prod.id === id);
      return `
        <div class="cart-item" style="margin-top:1rem;">
          <img src="${p.image}" alt="${p.name}" />
          <div style="flex:1;">
            <strong>${p.name}</strong>
            <div style="font-size:0.82rem;color:var(--muted);">$${p.price}</div>
            <button class="action-link" style="margin-top:0.5rem;text-decoration:underline;" onclick="addToCart(${p.id}); document.getElementById('wishlistModal').classList.remove('open');">
              Move to Bag
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Event Listeners
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      renderCatalog();
    });
  });

  document.getElementById('searchInput').addEventListener('input', renderCatalog);
  document.getElementById('sortSelect').addEventListener('change', renderCatalog);

  document.getElementById('openCartBtn').addEventListener('click', () => {
    renderCart();
    document.getElementById('cartDrawer').classList.add('open');
  });
  document.getElementById('closeCartBtn').addEventListener('click', () => {
    document.getElementById('cartDrawer').classList.remove('open');
  });

  document.getElementById('openWishlistBtn').addEventListener('click', () => {
    renderWishlist();
    document.getElementById('wishlistModal').classList.add('open');
  });
  document.getElementById('closeWishBtn').addEventListener('click', () => {
    document.getElementById('wishlistModal').classList.remove('open');
  });
  document.getElementById('closeDetailBtn').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('open');
  });

  document.getElementById('promoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    const msg = document.getElementById('promoMsg');
    if (code === 'VELO15') {
      discountRate = 0.15;
      msg.textContent = '15% archival discount applied.';
    } else {
      discountRate = 0;
      msg.textContent = 'Invalid code. Try VELO15.';
    }
    renderCart();
  });

  document.getElementById('proceedCheckoutBtn').addEventListener('click', () => {
    if (!cart.length) return;
    document.getElementById('checkoutForm').classList.remove('hidden');
  });

  document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    cart = [];
    discountRate = 0;
    saveState();
    renderCart();
    e.target.reset();
    e.target.classList.add('hidden');
    document.getElementById('cartDrawer').classList.remove('open');
    alert('Order confirmed. Dispatch dossier sent to your email.');
  });

  updateBadges();
  renderCatalog();
});