// Sample product data
const products = [
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
    },
    {
        id: 3,
        name: "Whole Wheat Bread",
        category: "bakery",
        price: 2.49,
        discount: 1.99,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        stock: 5,
        description: "Freshly baked whole wheat bread",
        seasonal: false
    },
    {
        id: 4,
        name: "Fresh Salmon Fillet",
        category: "meat",
        price: 12.99,
        discount: 10.99,
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        stock: 3,
        description: "Wild-caught salmon fillet",
        seasonal: true
    },
    {
        id: 5,
        name: "Orange Juice",
        category: "beverages",
        price: 3.49,
        discount: null,
        image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        stock: 20,
        description: "100% pure squeezed orange juice",
        seasonal: true
    },
    {
        id: 6,
        name: "Potato Chips",
        category: "snacks",
        price: 1.99,
        discount: 1.49,
        image: "https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        stock: 0,
        description: "Crunchy potato chips with sea salt",
        seasonal: false
    },
    {
        id: 7,
        name: "Organic Bananas",
        category: "fruits",
        price: 1.49,
        discount: 1.29,
        image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        stock: 25,
        description: "Sweet organic bananas",
        seasonal: false
    },
    {
        id: 8,
        name: "Free Range Eggs",
        category: "dairy",
        price: 4.99,
        discount: null,
        image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        stock: 12,
        description: "Dozen free range eggs",
        seasonal: false
    }
];

// Categories data
const categories = [
    { id: "fruits", name: "Fruits & Vegetables", productCount: 2 },
    { id: "dairy", name: "Dairy & Eggs", productCount: 2 },
    { id: "bakery", name: "Bakery", productCount: 1 },
    { id: "meat", name: "Meat & Seafood", productCount: 1 },
    { id: "beverages", name: "Beverages", productCount: 1 },
    { id: "snacks", name: "Snacks", productCount: 1 }
];

// Orders data
const orders = [
    {
        id: 1001,
        customer: "John Doe",
        items: 5,
        total: 42.50,
        status: "new",
        date: "2023-06-15"
    },
    {
        id: 1002,
        customer: "Jane Smith",
        items: 8,
        total: 68.25,
        status: "processing",
        date: "2023-06-14"
    },
    {
        id: 1003,
        customer: "Robert Johnson",
        items: 3,
        total: 22.75,
        status: "completed",
        date: "2023-06-12"
    }
];