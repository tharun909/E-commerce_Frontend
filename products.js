// ===================================
// PRODUCT DISPLAY & MANAGEMENT
// ===================================

/**
 * Initialize and display all products
 */
function createMultipleCards() {
  let products = localStorage.getItem("products");
  products = JSON.parse(products);

  let carts = localStorage.getItem("carts");
  carts = JSON.parse(carts);

  let wishlist = localStorage.getItem("wishlist");
  wishlist = JSON.parse(wishlist) || [];

  if (!products || products.length === 0) {
    document.getElementById("product-count").textContent = "No products found";
    return;
  }

  const count = products.length;
  document.getElementById("product-count").textContent =
    count + " product" + (count !== 1 ? "s" : "") + " found";

  products.forEach(function (product) {
    var dataArray = carts ? carts.filter((cart) => cart.name == product.name) : [];
    var inWishlist = wishlist.some((item) => item.name === product.name);
    createCard(product, dataArray, inWishlist);
  });
}

/**
 * Create individual product card
 * @param {Object} product - Product data
 * @param {Array} dataArray - Cart items matching this product
 * @param {Boolean} inWishlist - Whether product is in wishlist
 */
function createCard(product, dataArray, inWishlist) {
  const inCart = dataArray && dataArray.length > 0;

  const card = document.createElement("div");
  card.className = "product-card" + (inCart ? " in-cart" : "");

  card.innerHTML = `
    <div class="product-img-wrapper">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
      ${inCart ? `<span class="in-cart-badge"><i class="bi bi-bag-check-fill"></i></span>` : ""}
      <button class="wishlist-btn ${inWishlist ? 'active' : ''}" title="${inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}">
        <i class="bi bi-heart${inWishlist ? '-fill' : ''}"></i>
      </button>
    </div>
    <div class="product-body">
      <div class="product-category-tag">${product.category || "Featured"}</div>
      <h3 class="product-name">${product.name}</h3>
      <p class="product-desc">${product.description}</p>
      <div class="product-footer">
        <span class="product-price">$${product.price}</span>
        <div class="card-actions"></div>
      </div>
    </div>
  `;

  const actionsDiv = card.querySelector(".card-actions");

  // Add to Cart Button
  const addBtn = document.createElement("button");
  addBtn.className = "add-to-cart";
  addBtn.innerHTML = `<i class="bi bi-bag-plus"></i> Add`;
  addBtn.style.display = inCart ? "none" : "inline-flex";

  // Remove from Cart Button
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-from-cart";
  removeBtn.innerHTML = `<i class="bi bi-bag-dash"></i> Remove`;
  removeBtn.style.display = inCart ? "inline-flex" : "none";

  // Add to Cart Handler
  addBtn.onclick = function () {
    addBtn.style.display = "none";
    removeBtn.style.display = "inline-flex";
    card.classList.add("in-cart");
    
    const imgWrapper = card.querySelector(".product-img-wrapper");
    if (!imgWrapper.querySelector(".in-cart-badge")) {
      const badge = document.createElement("span");
      badge.className = "in-cart-badge";
      badge.innerHTML = `<i class="bi bi-bag-check-fill"></i>`;
      imgWrapper.appendChild(badge);
    }
    addInCart(product);
  };

  // Remove from Cart Handler
  removeBtn.onclick = function () {
    addBtn.style.display = "inline-flex";
    removeBtn.style.display = "none";
    card.classList.remove("in-cart");
    const badge = card.querySelector(".in-cart-badge");
    if (badge) badge.remove();
    removeCart(product.name);
  };

  // Wishlist Button Handler
  const wishlistBtn = card.querySelector(".wishlist-btn");
  wishlistBtn.onclick = function (e) {
    e.stopPropagation();
    toggleWishlist(product, wishlistBtn);
  };

  actionsDiv.appendChild(addBtn);
  actionsDiv.appendChild(removeBtn);

  document.querySelector("#products").appendChild(card);
}

// ===================================
// CART MANAGEMENT
// ===================================

/**
 * Add product to cart with quantity
 * @param {Object} product - Product to add
 */
function addInCart(product) {
  let carts = localStorage.getItem("carts");
  carts = JSON.parse(carts) || [];
  
  const cartItem = {
    ...product,
    quantity: 1
  };
  
  carts.push(cartItem);
  localStorage.setItem("carts", JSON.stringify(carts));
  
  // Update cart badge
  updateCartBadge();
}

/**
 * Remove product from cart
 * @param {String} name - Product name to remove
 */
function removeCart(name) {
  let carts = localStorage.getItem("carts");
  carts = JSON.parse(carts) || [];
  var newcart = carts.filter((cart) => cart.name !== name);
  localStorage.setItem("carts", JSON.stringify(newcart));
  
  // Update cart badge
  updateCartBadge();
}

// ===================================
// WISHLIST MANAGEMENT
// ===================================

/**
 * Toggle product in wishlist
 * @param {Object} product - Product to toggle
 * @param {HTMLElement} button - Wishlist button element
 */
function toggleWishlist(product, button) {
  let wishlist = localStorage.getItem("wishlist");
  wishlist = JSON.parse(wishlist) || [];
  
  const index = wishlist.findIndex((item) => item.name === product.name);
  
  if (index > -1) {
    // Remove from wishlist
    wishlist.splice(index, 1);
    button.classList.remove("active");
    button.querySelector("i").className = "bi bi-heart";
    button.title = "Add to wishlist";
  } else {
    // Add to wishlist
    wishlist.push(product);
    button.classList.add("active");
    button.querySelector("i").className = "bi bi-heart-fill";
    button.title = "Remove from wishlist";
  }
  
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// ===================================
// PRODUCT FILTERING
// ===================================

/**
 * Filter products by category
 * @param {String} categoryName - Category to filter by
 */
function filterProducts(categoryName) {
  var productsDiv = document.getElementById("products");
  var products = JSON.parse(localStorage.getItem("products")) || [];
  let carts = JSON.parse(localStorage.getItem("carts")) || [];
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  // Clear existing products
  while (productsDiv.firstChild) {
    productsDiv.firstChild.remove();
  }

  // Filter products
  var filteredProducts =
    categoryName === "all"
      ? products
      : products.filter((product) => product.category === categoryName);

  const count = filteredProducts.length;
  document.getElementById("product-count").textContent =
    count + " product" + (count !== 1 ? "s" : "") + " found";

  // Display empty state or products
  if (count === 0) {
    productsDiv.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-box-seam"></i>
        <h3>No products in this category</h3>
      </div>`;
    return;
  }

  filteredProducts.forEach((product) => {
    var dataArray = carts.filter((cart) => cart.name == product.name);
    var inWishlist = wishlist.some((item) => item.name === product.name);
    createCard(product, dataArray, inWishlist);
  });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================

/**
 * Update cart badge count in navigation
 */
function updateCartBadge() {
  const carts = JSON.parse(localStorage.getItem("carts")) || [];
  const cartBadge = document.getElementById("cart-badge");
  
  if (cartBadge) {
    if (carts.length > 0) {
      cartBadge.textContent = carts.length;
      cartBadge.style.display = "flex";
    } else {
      cartBadge.style.display = "none";
    }
  }
}

// Initialize cart badge on page load
document.addEventListener("DOMContentLoaded", function() {
  updateCartBadge();
});
