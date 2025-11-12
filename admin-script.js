// Global variables
let products = [];
let categories = [];
let orders = [];

// Google Sheets configuration (same as main script)
const SHEET_ID = 'https://docs.google.com/spreadsheets/d/1jCxWsJWBa_e_oh2C4BTGDFVvTHWghwp9-sRRhCYWyU8/edit?usp=sharing';
const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminPanel();
});

// Initialize the admin panel
async function initializeAdminPanel() {
    showAdminLoading(true);
    try {
        await loadDataFromGoogleSheets();
        renderAdminProducts();
        renderAdminCategories();
        renderAdminOrders();
        setupGoogleSheetsIFrame();
        
        // Add event listeners
        document.getElementById('order-filter').addEventListener('change', filterAdminOrders);
        
    } catch (error) {
        console.error('Error initializing admin panel:', error);
        showAdminNotification('Error loading data. Please check your Google Sheets configuration.', 'error');
    } finally {
        showAdminLoading(false);
    }
}

// Load data from Google Sheets
async function loadDataFromGoogleSheets() {
    try {
        // Load products
        const productsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Products!A2:I?key=${API_KEY}`;
        const productsResponse = await fetch(productsUrl);
        const productsData = await productsResponse.json();
        
        products = productsData.values ? productsData.values.map(row => ({
            id: parseInt(row[0]),
            name: row[1],
            category: row[2],
            price: parseFloat(row[3]),
            discount: row[4] ? parseFloat(row[4]) : null,
            image: row[5],
            stock: parseInt(row[6]),
            description: row[7] || "No description",
            seasonal: row[8] === 'TRUE'
        })) : [];

        // Load categories
        const categoriesUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Categories!A2:C?key=${API_KEY}`;
        const categoriesResponse = await fetch(categoriesUrl);
        const categoriesData = await categoriesResponse.json();
        
        categories = categoriesData.values ? categoriesData.values.map(row => ({
            id: row[0],
            name: row[1],
            productCount: parseInt(row[2])
        })) : [];

        // Load orders (if available)
        try {
            const ordersUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Orders!A2:F?key=${API_KEY}`;
            const ordersResponse = await fetch(ordersUrl);
            const ordersData = await ordersResponse.json();
            
            orders = ordersData.values ? ordersData.values.map(row => ({
                id: parseInt(row[0]),
                customer: row[1],
                items: parseInt(row[2]),
                total: parseFloat(row[3]),
                status: row[4],
                date: row[5]
            })) : [];
        } catch (orderError) {
            console.warn('No orders sheet found or error loading orders:', orderError);
            orders = [];
        }

    } catch (error) {
        console.error('Error loading data from Google Sheets:', error);
        throw error;
    }
}

// Setup Google Sheets iframe
function setupGoogleSheetsIFrame() {
    const iframe = document.getElementById('google-sheets-iframe');
    if (SHEET_ID && SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID_HERE') {
        iframe.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`;
    } else {
        iframe.src = 'about:blank';
        iframe.srcdoc = `
            <html>
                <body style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f5f5f5;">
                    <div style="text-align: center; padding: 20px;">
                        <h3>Google Sheets Not Configured</h3>
                        <p>Please set up your Google Sheet and update the SHEET_ID in the code.</p>
                    </div>
                </body>
            </html>
        `;
    }
}

// Render products in admin panel
function renderAdminProducts() {
    const container = document.getElementById('products-list');
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found. Add products to your Google Sheet.</p>';
        return;
    }
    
    products.forEach(product => {
        container.innerHTML += `
            <div class="category-item">
                <div class="category-header">
                    <div class="category-title">${product.name}</div>
                    <div>
                        <span class="stock-badge ${getStockStatus(product.stock).class}">
                            ${product.stock} in stock
                        </span>
                    </div>
                </div>
                <div><strong>Category:</strong> ${getCategoryName(product.category)}</div>
                <div><strong>Price:</strong> $${product.price.toFixed(2)} 
                    ${product.discount ? `<span style="color: var(--accent);">(Sale: $${product.discount.toFixed(2)})</span>` : ''}
                </div>
                <div><strong>ID:</strong> ${product.id}</div>
                <div class="product-actions" style="margin-top: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="editProductInSheet(${product.id})">
                        <i class="fas fa-edit"></i> Edit in Sheet
                    </button>
                </div>
            </div>
        `;
    });
}

// Render categories in admin panel
function renderAdminCategories() {
    const container = document.getElementById('categories-list');
    container.innerHTML = '';
    
    if (categories.length === 0) {
        container.innerHTML = '<p>No categories found. Add categories to your Google Sheet.</p>';
        return;
    }
    
    categories.forEach(category => {
        container.innerHTML += `
            <div class="category-item">
                <div class="category-header">
                    <div class="category-title">${category.name}</div>
                    <div>
                        <span class="stock-badge">${category.productCount} products</span>
                    </div>
                </div>
                <div><strong>ID:</strong> ${category.id}</div>
                <div class="product-actions" style="margin-top: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="editCategoryInSheet('${category.id}')">
                        <i class="fas fa-edit"></i> Edit in Sheet
                    </button>
                </div>
            </div>
        `;
    });
}

// Render orders in admin panel
function renderAdminOrders() {
    const container = document.getElementById('orders-list');
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No orders found. Orders will appear here when customers place orders.</p>';
        return;
    }
    
    orders.forEach(order => {
        container.innerHTML += `
            <div class="category-item">
                <div class="category-header">
                    <div><strong>Order #${order.id}</strong></div>
                    <div><span class="badge ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
                </div>
                <div><strong>Customer:</strong> ${order.customer}</div>
                <div><strong>Date:</strong> ${order.date}</div>
                <div><strong>Items:</strong> ${order.items}</div>
                <div><strong>Total:</strong> $${order.total.toFixed(2)}</div>
                <div class="order-actions" style="margin-top: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-sm" onclick="contactCustomer(${order.id})">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
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

// Get stock status
function getStockStatus(stock) {
    if (stock > 10) return { text: 'In Stock', class: '' };
    if (stock > 0) return { text: 'Low Stock', class: 'low-stock' };
    return { text: 'Out of Stock', class: 'out-of-stock' };
}

// Switch between admin tabs
function openAdminTab(tabName) {
    // Hide all tab content
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show the selected tab and mark button as active
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Scroll to top when switching tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filter orders by status
function filterAdminOrders() {
    const status = document.getElementById('order-filter').value;
    
    if (status === 'all') {
        renderAdminOrders();
        return;
    }
    
    const filteredOrders = orders.filter(order => order.status === status);
    
    const container = document.getElementById('orders-list');
    container.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        container.innerHTML = '<p>No orders found with this status</p>';
        return;
    }
    
    filteredOrders.forEach(order => {
        container.innerHTML += `
            <div class="category-item">
                <div class="category-header">
                    <div><strong>Order #${order.id}</strong></div>
                    <div><span class="badge ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></div>
                </div>
                <div><strong>Customer:</strong> ${order.customer}</div>
                <div><strong>Date:</strong> ${order.date}</div>
                <div><strong>Items:</strong> ${order.items}</div>
                <div><strong>Total:</strong> $${order.total.toFixed(2)}</div>
                <div class="order-actions" style="margin-top: 10px;">
                    <button class="btn btn-sm btn-primary" onclick="viewOrderDetails(${order.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-sm" onclick="contactCustomer(${order.id})">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </button>
                </div>
            </div>
        `;
    });
}

// Refresh data from Google Sheets
async function refreshData() {
    showAdminLoading(true);
    try {
        await loadDataFromGoogleSheets();
        renderAdminProducts();
        renderAdminCategories();
        renderAdminOrders();
        showAdminNotification('Data refreshed successfully from Google Sheets');
    } catch (error) {
        console.error('Error refreshing data:', error);
        showAdminNotification('Error refreshing data. Please check your Google Sheets configuration.', 'error');
    } finally {
        showAdminLoading(false);
    }
}

// Open store in new tab
function openStore() {
    window.open('index.html', '_blank');
}

// Open Google Sheets in new tab
function openSheetsInNewTab() {
    if (SHEET_ID && SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID_HERE') {
        window.open(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`, '_blank');
    } else {
        showAdminNotification('Please configure your Google Sheet ID first', 'error');
    }
}

// Show sheet instructions
function showSheetInstructions() {
    alert(`Google Sheets Setup Instructions:

1. Create a Google Sheet with three tabs: Products, Categories, Orders
2. Share the sheet publicly (Anyone with link can view)
3. Update the SHEET_ID in the code with your sheet's ID
4. Make sure your sheet has the correct column structure:

Products Sheet:
A: ID, B: Name, C: Category, D: Price, E: Discount, F: Image URL, G: Stock, H: Description, I: Seasonal

Categories Sheet:
A: ID, B: Name, C: Product Count

Orders Sheet (optional):
A: ID, B: Customer, C: Items, D: Total, E: Status, F: Date`);
}

// Edit product in Google Sheets
function editProductInSheet(productId) {
    if (SHEET_ID && SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID_HERE') {
        // Find the row number for the product
        const product = products.find(p => p.id === productId);
        if (product) {
            // This would ideally find the exact row, but for simplicity we just open the sheet
            window.open(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`, '_blank');
            showAdminNotification('Open the Products sheet and find the product to edit');
        }
    } else {
        showAdminNotification('Please configure your Google Sheet ID first', 'error');
    }
}

// Edit category in Google Sheets
function editCategoryInSheet(categoryId) {
    if (SHEET_ID && SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID_HERE') {
        window.open(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`, '_blank');
        showAdminNotification('Open the Categories sheet and find the category to edit');
    } else {
        showAdminNotification('Please configure your Google Sheet ID first', 'error');
    }
}

// View order details
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Details:
        
Order #: ${order.id}
Customer: ${order.customer}
Date: ${order.date}
Items: ${order.items}
Total: $${order.total.toFixed(2)}
Status: ${order.status}
        
This order information is loaded from your Google Sheets.`);
    }
}

// Contact customer via WhatsApp
function contactCustomer(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        const phone = "9346145612"; // Your WhatsApp number
        const message = `Order Inquiry:%0a%0aOrder #${order.id}%0aCustomer: ${order.customer}%0aTotal: $${order.total.toFixed(2)}%0a%0aPlease provide an update on this order.`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Show admin notification
function showAdminNotification(message, type = "success") {
    const notification = document.getElementById('notification');
    notification.className = `notification ${type}`;
    document.getElementById('notification-text').textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Show admin loading
function showAdminLoading(show) {
    // You can implement a loading indicator here
    if (show) {
        showAdminNotification('Loading data from Google Sheets...', 'warning');
    }
}