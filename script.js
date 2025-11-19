// Global variables
let products = [];
let categories = [];
let cart = [];
let currentFilter = "all";

// Google Sheets configuration
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your Google Sheet ID
const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE'; // Replace with your Google API Key

// Expand search bar on focus
function expandSearch() {
    const searchBar = document.querySelector('.search-bar');
    const logoBrand = document.querySelector('.logo-brand');
    const closeIcon = document.querySelector('.close-icon');
    const categoriesBar = document.getElementById('categories-bar');
    const categoryNav = document.querySelector('.category-nav');
    const categoriesContainer = document.querySelector('.categories-container');

    searchBar.classList.add('expanded');
    logoBrand.classList.add('hidden');
    if (categoriesBar) categoriesBar.classList.add('hidden');
    if (categoriesContainer) categoriesContainer.classList.add('hidden');
    if (closeIcon) closeIcon.style.display = 'block';
    updateQuickSheetVisibility();
}

// Collapse search bar on blur
function collapseSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBar = document.querySelector('.search-bar');
    const logoBrand = document.querySelector('.logo-brand');
    const closeIcon = document.querySelector('.close-icon');
    const categoriesBar = document.getElementById('categories-bar');
    const categoryNav = document.querySelector('.category-nav');

    // Only collapse if search bar is empty
    if (!searchInput || searchInput.value.trim() === '') {
        if (searchBar) searchBar.classList.remove('expanded');
        if (logoBrand) logoBrand.classList.remove('hidden');
        if (categoriesBar) categoriesBar.classList.remove('hidden');
        if (categoriesContainer) categoriesContainer.classList.remove('hidden');
        if (closeIcon) closeIcon.style.display = 'none';
        updateQuickSheetVisibility();
    }
}

// Focus search input when search icon is clicked
function focusSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.focus();
}

// Clear search input and focus it (keeps search expanded)
function clearSearch() {
    const categoriesBar = document.getElementById('categories-bar');
    const categoryNav = document.querySelector('.category-nav');
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    if (categoriesBar) categoriesBar.classList.add('hidden');
    if (categoriesContainer) categoriesContainer.classList.add('hidden');
    updateQuickSheetVisibility();
}

// Show quick-sheet button when the main logo is hidden, hide it when logo is visible
function updateQuickSheetVisibility() {
    const logoBrand = document.querySelector('.logo-brand');
    const quickBtn = document.getElementById('quick-sheet-btn');
    if (!quickBtn) return;
    // If logo is hidden via the `.hidden` class or not visible, show quick sheet button
    const logoHidden = logoBrand && logoBrand.classList.contains('hidden');
    quickBtn.style.display = logoHidden ? 'inline-flex' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize the application
async function initializeApp() {
    const categoriesBar = document.getElementById('categories-bar');
    const categoryNav = document.querySelector('.category-nav');
    const categoriesContainer = document.querySelector('.categories-container');
    if (categoriesBar) categoriesBar.classList.remove('hidden');
    if (categoryNav) categoryNav.classList.remove('hidden');
    if (categoriesContainer) categoriesContainer.classList.remove('hidden');
    showLoading(true);
    try {
        await loadDataFromGoogleSheets();
        renderCategories();
        renderProducts(products);
        renderSeasonalProducts();
        updateCartCount();
        loadCart();

        // Add event listeners
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.addEventListener('input', searchProducts);

    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error loading products. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Load data from Google Sheets
async function loadDataFromGoogleSheets() {
    try {
        // Load products
        const productsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Products!A2:H?key=${API_KEY}`;
        const productsResponse = await fetch(productsUrl);
        const productsData = await productsResponse.json();
        
        products = productsData.values.map(row => ({
            id: parseInt(row[0]),
            name: row[1],
            category: row[2],
            price: parseFloat(row[3]),
            discount: row[4] ? parseFloat(row[4]) : null,
            image: row[5],
            stock: parseInt(row[6]),
            description: row[7] || "No description",
            seasonal: row[8] === 'TRUE'
        }));

        // Load categories
        const categoriesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Categories!A2:C?key=${API_KEY}`;
        const categoriesResponse = await fetch(categoriesUrl);
        const categoriesData = await categoriesResponse.json();
        
        categories = categoriesData.values.map(row => ({
            id: row[0],
            name: row[1],
            productCount: parseInt(row[2])
        }));

    } catch (error) {
        console.error('Error loading data from Google Sheets:', error);
        // Fallback to sample data if Google Sheets fails
        loadSampleData();
    }
}

// Fallback sample data
function loadSampleData() {
    products = [
        {
            id: 1,
            name: "Fresh Apples",
            category: "fruits",
            price: 2.99,
            discount: 2.49,
            image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            stock: 15,
            description: "Crisp and juicy organic apples",
            seasonal: false
        },
        {
            id: 2,
            name: "Organic Milk",
            category: "dairy",
            price: 3.99,
            discount: null,
            image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            stock: 8,
            description: "Fresh organic milk from grass-fed cows",
            seasonal: false
        }
    ];

    categories = [
        { id: "fruits", name: "Fruits & Vegetables", productCount: 1 },
        { id: "dairy", name: "Dairy & Eggs", productCount: 1 },
        { id: "bakery", name: "Bakery", productCount: 0 },
        { id: "meat", name: "Meat & Seafood", productCount: 0 },
        { id: "beverages", name: "Beverages", productCount: 0 },
        { id: "snacks", name: "Snacks", productCount: 0 }
    ];
}

// Render categories navigation
function renderCategories() {
    const container = document.getElementById('category-nav-list');
    container.innerHTML = '';
    
    // Add "All Products" first
    container.innerHTML += `
        <li><a href="#" class="active" onclick="filterProducts('all')">All Products</a></li>
    `;
    
    // Add other categories
    categories.forEach(category => {
        container.innerHTML += `
            <li><a href="#" onclick="filterProducts('${category.id}')">${category.name}</a></li>
        `;
    });
}

// Render products to the page
function renderProducts(productsToRender) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';
    
    if (productsToRender.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
                <h3>No products found</h3>
                <p>We couldn't find any products matching your criteria</p>
            </div>
        `;
        return;
    }
    
    productsToRender.forEach(product => {
        const stockStatus = getStockStatus(product.stock);
        
        container.innerHTML += `
            <div class="product-card">
                <div class="stock-badge ${stockStatus.class}">${stockStatus.text}</div>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400?text=Product+Image'">
                </div>
                <div class="product-info">
                    <div class="product-category">${getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="price-current">$${product.discount ? product.discount.toFixed(2) : product.price.toFixed(2)}</span>
                        ${product.discount ? `<span class="price-original">$${product.price.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-wishlist"><i class="far fa-heart"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Render seasonal products
function renderSeasonalProducts() {
    const container = document.getElementById('seasonal-container');
    const seasonalProducts = products.filter(p => p.seasonal);
    
    if (seasonalProducts.length === 0) {
        container.innerHTML = '<p>No seasonal products available at the moment.</p>';
        return;
    }
    
    seasonalProducts.forEach(product => {
        const stockStatus = getStockStatus(product.stock);
        
        container.innerHTML += `
            <div class="product-card">
                <div class="stock-badge ${stockStatus.class}">${stockStatus.text}</div>
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400?text=Product+Image'">
                </div>
                <div class="product-info">
                    <div class="product-category">${getCategoryName(product.category)}</div>
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-price">
                        <span class="price-current">$${product.discount ? product.discount.toFixed(2) : product.price.toFixed(2)}</span>
                        ${product.discount ? `<span class="price-original">$${product.price.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="btn-wishlist"><i class="far fa-heart"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Get category name by ID
function getCategoryName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
}

// Get stock status text and class
function getStockStatus(stock) {
    if (stock > 10) return { text: 'In Stock', class: '' };
    if (stock > 0) return { text: 'Low Stock', class: 'low-stock' };
    return { text: 'Out of Stock', class: 'out-of-stock' };
}

// Filter products by category
function filterProducts(category) {
    currentFilter = category;
    
    // Update active category in navigation
    document.querySelectorAll('.category-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mark the clicked category as active
    event?.currentTarget?.classList.add('active');
    
    // Show loading spinner
    showLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
        let filteredProducts = [];
        
        if (category === 'all') {
            filteredProducts = products;
        } else if (category === 'organic') {
            // Special filter for organic products
            filteredProducts = products.filter(p => 
                p.name.toLowerCase().includes('organic') || 
                p.description.toLowerCase().includes('organic')
            );
        } else {
            filteredProducts = products.filter(p => p.category === category);
        }
        
        renderProducts(filteredProducts);
        showLoading(false);
        
        // Scroll to products section
        document.getElementById('products-container').scrollIntoView({
            behavior: 'smooth'
        });
    }, 500);
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Check stock
    if (product.stock === 0) {
        showNotification("This product is out of stock", "error");
        return;
    }
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Check stock
        if (existingItem.quantity >= product.stock) {
            showNotification("We don't have that many in stock", "error");
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.discount || product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCartCount();
    showNotification(`${product.name} added to cart`);
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = count;
    
    // Save cart to localStorage
    localStorage.setItem('freshmart-cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('freshmart-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

// Open cart modal
function openCart() {
    const modal = document.getElementById('cart-modal');
    const cartItems = document.getElementById('cart-items');
    const totalPrice = document.getElementById('cart-total-price');
    
    // Render cart items
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalPrice.textContent = '$0.00';
    } else {
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartItems.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/400?text=Product+Image'">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity} = $${itemTotal.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity(${item.id}, 1)">+</button>
                            <span class="cart-item-remove" onclick="removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        totalPrice.textContent = '$' + total.toFixed(2);
    }
    
    modal.style.display = 'flex';
}

// Close cart modal
function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Update cart item quantity
function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (!item) return;
    
    item.quantity += change;
    
    // Remove if quantity is zero
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    // Update cart display
    openCart();
    updateCartCount();
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    openCart();
    updateCartCount();
    showNotification("Item removed from cart", "warning");
}

// Checkout
function checkout() {
    if (cart.length === 0) return;
    
    // Generate WhatsApp message
    const phone = "9346145612"; // Replace with your WhatsApp number
    let message = "New Order from FreshMart:%0a%0a";
    
    cart.forEach(item => {
        message += `- ${item.name} (Qty: ${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}%0a`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `%0aTotal: $${total.toFixed(2)}%0a%0aPlease pack these items!`;
    
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart
    cart = [];
    updateCartCount();
    closeCart();
    showNotification("Order placed! Check WhatsApp", "success");
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (!searchTerm) {
        renderProducts(currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter));
        return;
    }
    
    const results = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.category && getCategoryName(product.category).toLowerCase().includes(searchTerm)) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    
    if (results.length === 0) {
        document.getElementById('products-container').innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
                <h3>No products found</h3>
                <p>We couldn't find any products matching "${searchTerm}"</p>
                <button class="btn btn-primary" style="margin-top: 15px;" onclick="requestProduct('${searchTerm}')">
                    Request this product
                </button>
            </div>
        `;
    } else {
        renderProducts(results);
    }
}

// Request product
function requestProduct(productName) {
    const phone = "9346145612"; // Replace with your WhatsApp number
    const message = `Product Request:%0a%0aCustomer is looking for: ${productName}%0a%0aPlease add this to your inventory if available!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    showNotification("Request sent to store owner");
}

// Show notification
function showNotification(message, type = "success") {
    const notification = document.getElementById('notification');
    notification.className = `notification ${type}`;
    document.getElementById('notification-text').textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Show/hide loading spinner
function showLoading(show) {
    const spinner = document.getElementById('loading-spinner');
    spinner.style.display = show ? 'block' : 'none';
}

// Open admin panel in new tab
function openAdminPanel() {
    window.open('admin.html', '_blank');
}

// Refresh data from Google Sheets
async function refreshData() {
    showLoading(true);
    try {
        await loadDataFromGoogleSheets();
        renderCategories();
        renderProducts(products);
        renderSeasonalProducts();
        showNotification('Data refreshed successfully');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showNotification('Error refreshing data', 'error');
    } finally {
        showLoading(false);
    }
}