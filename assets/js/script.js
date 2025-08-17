// Sample product data
const products = [
  {
    id: 1,
    title: "Smartphone XYZ",
    price: 299.99,
    oldPrice: 349.99,
    discount: "14% off",
    category: "Electronics",
    tags: ["Top Deal", "Limited Stock"],
    rating: 4.5,
    images: ["assets/images/images.jpeg", "assets/images/images_2.jpeg", "assets/images/images_3.jpeg"],
    reviews: [
      { username: "JohnDoe", text: "Great phone with excellent features. The camera quality is amazing, and the battery life lasts all day. Highly recommend for tech enthusiasts!", rating: 5 },
      { username: "JaneSmith", text: "Really good value for money. The performance is smooth, but the charger could be faster. Overall, a solid purchase.", rating: 4 }
    ],
    flashSaleEnd: "2025-08-05T23:59:59"
  },
  // Add more products...
];

// LocalStorage helpers
const getCart = () => JSON.parse(localStorage.getItem('cart')) || [];
const setCart = (cart) => localStorage.setItem('cart', JSON.stringify(cart));
const getWishlist = () => JSON.parse(localStorage.getItem('wishlist')) || [];
const setWishlist = (wishlist) => localStorage.setItem('wishlist', JSON.stringify(wishlist));
const getUser = () => JSON.parse(localStorage.getItem('user')) || null;
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));
const getRecentlyViewed = () => JSON.parse(localStorage.getItem('recentlyViewed')) || [];
const setRecentlyViewed = (products) => localStorage.setItem('recentlyViewed', JSON.stringify(products));
const getOrders = () => JSON.parse(localStorage.getItem('orders')) || [];
const setOrders = (orders) => localStorage.setItem('orders', JSON.stringify(orders));

// Dark Mode
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');

// Install Prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  // Show install button or trigger manually
});

// Voice Search
const voiceSearch = document.getElementById('voiceSearch');
if (voiceSearch) {
  voiceSearch.addEventListener('click', () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.onresult = (event) => {
        const query = event.results[0][0].transcript;
        document.getElementById('searchInput').value = query;
        searchProducts(query);
      };
      recognition.start();
    }
  });
}

// Search Functionality
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    searchProducts(query);
  });
}
function searchProducts(query) {
  const filtered = products.filter(p => p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
  renderProducts(filtered);
}

// Render Products
function renderProducts(productsToRender) {
  const productGrid = document.getElementById('productGrid');
  if (!productGrid) return;
  productGrid.innerHTML = '';
  productsToRender.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card bg-white dark:bg-gray-800 p-4 rounded shadow';
    card.innerHTML = `
      <div class="skeleton h-48 w-full mb-4"></div>
      <img src="${product.images[0]}" alt="${product.title}" class="w-full h-48 object-cover rounded lazy-load" onload="this.classList.add('loaded')">
      <h3 class="text-lg font-bold">${product.title}</h3>
      <p class="text-green-600">$${product.price} <span class="line-through text-gray-500">$${product.oldPrice}</span></p>
      <p class="text-sm text-gray-600 dark:text-gray-300">${product.tags.join(', ')}</p>
      <a href="product.html?id=${product.id}" class="mt-2 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">View Details</a>
    `;
    productGrid.appendChild(card);
  });
}

// Product Detail Page
if (window.location.pathname.includes('product.html')) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'));
  const product = products.find(p => p.id === productId);
  if (product) {
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productPrice').textContent = `$${product.price}`;
    document.getElementById('oldPrice').textContent = `$${product.oldPrice}`;
    document.getElementById('discount').textContent = product.discount;
    document.getElementById('productTags').textContent = product.tags.join(', ');
    document.getElementById('mainImage').src = product.images[0];
    document.getElementById('reviews').innerHTML = product.reviews.map(r => `
      <div class="border-b py-2">
        <p class="font-bold">${r.username}</p>
        <p>${r.text}</p>
        <p>Rating: ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</p>
      </div>
    `).join('');
    // Countdown Timer
    const countdown = document.getElementById('countdown');
    const endTime = new Date(product.flashSaleEnd).getTime();
    setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      if (distance < 0) {
        countdown.textContent = 'Sale Ended';
        return;
      }
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      countdown.textContent = `${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
    // Add to Cart
    document.getElementById('addToCart').addEventListener('click', () => {
      const cart = getCart();
      const existing = cart.find(item => item.id === product.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      setCart(cart);
      showSnackbar(`${product.title} added to cart`, () => {
        const cart = getCart();
        const updated = cart.filter(item => item.id !== product.id);
        setCart(updated);
        updateCartCount();
      });
      updateCartCount();
      document.getElementById('addToCart').disabled = true;
      setTimeout(() => document.getElementById('addToCart').disabled = false, 1000);
    });
    // Add to Wishlist
    document.getElementById('addToWishlist').addEventListener('click', () => {
      const wishlist = getWishlist();
      if (!wishlist.find(item => item.id === product.id)) {
        wishlist.push(product);
        setWishlist(wishlist);
        showSnackbar(`${product.title} added to wishlist`);
      }
    });
    // Return Policy Popup
    document.getElementById('returnPolicy').addEventListener('click', () => {
      document.getElementById('returnPolicyPopup').classList.remove('hidden');
    });
    document.getElementById('closePopup').addEventListener('click', () => {
      document.getElementById('returnPolicyPopup').classList.add('hidden');
    });
    // Recently Viewed
    const recentlyViewed = getRecentlyViewed();
    if (!recentlyViewed.find(item => item.id === product.id)) {
      recentlyViewed.push(product);
      setRecentlyViewed(recentlyViewed.slice(-5)); // Keep last 5
    }
  }
}

// Cart Page
if (window.location.pathname.includes('cart.html')) {
  function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cart = getCart();
    cartItems.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded shadow';
      div.innerHTML = `
        <img src="${item.images[0]}" alt="${item.title}" class="w-16 h-16 object-cover rounded">
        <div>
          <h3 class="font-bold">${item.title}</h3>
          <p>$${item.price} x <input type="number" value="${item.quantity}" min="1" class="w-16 p-1 border rounded quantity" data-id="${item.id}"></p>
        </div>
        <button class="text-red-500 remove-item" data-id="${item.id}">Remove</button>
      `;
      cartItems.appendChild(div);
    });
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
    updateCartCount();
  }
  renderCart();
  document.getElementById('cartItems').addEventListener('change', (e) => {
    if (e.target.classList.contains('quantity')) {
      const cart = getCart();
      const id = parseInt(e.target.dataset.id);
      const item = cart.find(item => item.id === id);
      item.quantity = parseInt(e.target.value);
      setCart(cart);
      renderCart();
    }
  });
  document.getElementById('cartItems').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-item')) {
      const id = parseInt(e.target.dataset.id);
      const cart = getCart();
      const updated = cart.filter(item => item.id !== id);
      setCart(updated);
      showSnackbar('Item removed from cart', () => {
        setCart(cart);
        renderCart();
      });
      renderCart();
    }
  });
  document.getElementById('clearCart').addEventListener('click', () => {
    const cart = getCart();
    setCart([]);
    showSnackbar('Cart cleared', () => {
      setCart(cart);
      renderCart();
    });
    renderCart();
  });
}

// Checkout Page
if (window.location.pathname.includes('checkout.html')) {
  function renderOrderSummary() {
    const cart = getCart();
    const orderSummary = document.getElementById('orderSummary');
    let subtotal = 0;
    orderSummary.innerHTML = cart.map(item => {
      subtotal += item.price * item.quantity;
      return `<p>${item.title} x${item.quantity}: $${(item.price * item.quantity).toFixed(2)}</p>`;
    }).join('');
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    updateCheckoutTotal();
  }
  function updateCheckoutTotal() {
    const state = document.getElementById('state').value;
    const giftWrap = document.getElementById('giftWrap').checked;
    const subtotal = getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingFee = state === 'Lagos' ? 10 : state === 'Abuja' ? 15 : 20;
    const giftWrapFee = giftWrap ? 5 : 0;
    document.getElementById('shippingFee').textContent = `$${shippingFee.toFixed(2)}`;
    document.getElementById('giftWrapFee').textContent = `$${giftWrapFee.toFixed(2)}`;
    document.getElementById('orderTotal').textContent = `$${(subtotal + shippingFee + giftWrapFee).toFixed(2)}`;
  }
  document.getElementById('state').addEventListener('change', updateCheckoutTotal);
  document.getElementById('giftWrap').addEventListener('change', updateCheckoutTotal);
  document.getElementById('checkoutForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const order = {
      id: `ORDER-${Date.now()}`,
      items: getCart(),
      details: {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        state: document.getElementById('state').value,
        city: document.getElementById('city').value,
        giftWrap: document.getElementById('giftWrap').checked,
        coupon: document.getElementById('coupon').value
      }
    };
    const orders = getOrders();
    orders.push(order);
    setOrders(orders);
    setCart([]);
    document.getElementById('orderId').textContent = order.id;
    document.getElementById('successModal').classList.remove('hidden');
  });
  renderOrderSummary();
}

// Wishlist Page
if (window.location.pathname.includes('wishlist.html')) {
  function renderWishlist() {
    const wishlistItems = document.getElementById('wishlistItems');
    const wishlist = getWishlist();
    wishlistItems.innerHTML = '';
    wishlist.forEach(item => {
      const card = document.createElement('div');
      card.className = 'product-card bg-white dark:bg-gray-800 p-4 rounded shadow';
      card.innerHTML = `
        <img src="${item.images[0]}" alt="${item.title}" class="w-full h-48 object-cover rounded lazy-load" onload="this.classList.add('loaded')">
        <h3 class="text-lg font-bold">${item.title}</h3>
        <p class="text-green-600">$${item.price}</p>
        <button class="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 add-to-cart" data-id="${item.id}">Add to Cart</button>
        <button class="mt-2 text-red-500 remove-wishlist" data-id="${item.id}">Remove</button>
      `;
      wishlistItems.appendChild(card);
    });
  }
  document.getElementById('wishlistItems').addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-cart')) {
      const id = parseInt(e.target.dataset.id);
      const product = products.find(p => p.id === id);
      const cart = getCart();
      const existing = cart.find(item => item.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      setCart(cart);
      showSnackbar(`${product.title} added to cart`);
      updateCartCount();
    }
    if (e.target.classList.contains('remove-wishlist')) {
      const id = parseInt(e.target.dataset.id);
      const wishlist = getWishlist();
      const updated = wishlist.filter(item => item.id !== id);
      setWishlist(updated);
      showSnackbar('Item removed from wishlist');
      renderWishlist();
    }
  });
  renderWishlist();
}

// Login Page
if (window.location.pathname.includes('login.html')) {
  const authForm = document.getElementById('authForm');
  const toggleAuth = document.getElementById('toggleAuth');
  let isLogin = true;
  toggleAuth.addEventListener('click', (e) => {
    e.preventDefault();
    isLogin = !isLogin;
    toggleAuth.textContent = isLogin ? 'Register' : 'Login';
    authForm.querySelector('button').textContent = isLogin ? 'Login' : 'Register';
  });
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    setUser({ username, password });
    showSnackbar(isLogin ? 'Logged in successfully' : 'Registered successfully');
    setTimeout(() => window.location.href = '/', 1000);
  });
}

// Snackbar
function showSnackbar(message, undoAction) {
  const snackbar = document.getElementById('snackbar');
  const snackbarMessage = document.getElementById('snackbarMessage');
  snackbarMessage.textContent = message;
  snackbar.classList.add('show');
  if (undoAction) {
    document.getElementById('undoButton').onclick = () => {
      undoAction();
      snackbar.classList.remove('show');
    };
  } else {
    document.getElementById('undoButton').style.display = 'none';
  }
  setTimeout(() => snackbar.classList.remove('show'), 3000);
}

// Cart Count
function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cartCount').textContent = count;
}

// Go to Top
const goToTop = document.getElementById('goToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    goToTop.classList.remove('hidden');
  } else {
    goToTop.classList.add('hidden');
  }
});
goToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Initialize
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  renderProducts(products);
}
updateCartCount();
