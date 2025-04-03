require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" })); // Allow all origins (for now)
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 🔹 Store orders temporarily
let orders = [];

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ✅ Get All Products with 20% Profit Margin
app.get("/products", async (req, res) => {
  try {
    const query = req.query.q || "";

    // 🔹 Fetch all products from FakeStore API
    const response = await axios.get("https://fakestoreapi.com/products");
    let products = response.data;

    // 🔹 Apply a 20% profit margin
    products = products.map((product) => ({
      id: product.id,
      title: product.title,
      price: (parseFloat(product.price) * 1.2).toFixed(2), // 20% markup
      image: product.image,
      category: product.category,
      description: product.description,
      link: `https://fakestoreapi.com/products/${product.id}` // Direct link (for reference)
    }));

    // 🔹 If a search query is provided, filter products
    if (query) {
      products = products.filter((product) =>
        product.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      error: "Failed to fetch products",
      details: error.message
    });
  }
});

// ✅ Get Single Product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;

    // 🔹 Fetch product details from FakeStore API
    const response = await axios.get(`https://fakestoreapi.com/products/${productId}`);
    const product = response.data;

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 🔹 Apply 20% profit margin
    const modifiedProduct = {
      id: product.id,
      title: product.title,
      price: (parseFloat(product.price) * 1.2).toFixed(2), // 20% markup
      image: product.image,
      category: product.category,
      description: product.description,
      link: `https://fakestoreapi.com/products/${product.id}` // Keeping for reference
    };

    res.json({ success: true, product: modifiedProduct });
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product details",
      details: error.message
    });
  }
});

// ✅ Order Placement Route (Simulated Purchase)
app.post("/api/order", async (req, res) => {
  try {
    const { userId, items, shippingAddress } = req.body;
    if (!userId || !items || !shippingAddress) {
      return res.status(400).json({ error: "Missing order details" });
    }

    let totalAmount = 0;
    let orderItems = [];

    // 🔹 Fetch product details for each item
    for (let item of items) {
      const productResponse = await axios.get(`https://fakestoreapi.com/products/${item.productId}`);
      const product = productResponse.data;

      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });

      const itemTotal = (parseFloat(product.price) * 1.2 * item.quantity).toFixed(2);
      totalAmount += parseFloat(itemTotal);

      orderItems.push({
        productId: item.productId,
        title: product.title,
        quantity: item.quantity,
        price: itemTotal,
        image: product.image
      });
    }

    // 🔹 Simulate placing an order on the supplier's website
    const supplierOrder = await axios.post("https://fakestoreapi.com/carts", {
      userId,
      date: new Date().toISOString(),
      products: items.map(({ productId, quantity }) => ({ productId, quantity }))
    });

    // 🔹 Create order object
    const newOrder = {
      orderId: supplierOrder.data.id, // Use supplier order ID
      userId,
      items: orderItems,
      totalAmount: totalAmount.toFixed(2),
      status: "Processing", // Default status
      shippingAddress,
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder); // Store order locally

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order placement failed:", error.message);
    res.status(500).json({
      error: "Order placement failed",
      details: error.message
    });
  }
});

// ✅ Order Tracking Route
app.get("/api/order/:id", (req, res) => {
  const orderId = req.params.id;
  const order = orders.find(o => o.orderId == orderId);

  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  // 🔹 Simulate order status update
  const statusUpdates = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
  const currentStatusIndex = statusUpdates.indexOf(order.status);
  if (currentStatusIndex < statusUpdates.length - 1) {
    order.status = statusUpdates[currentStatusIndex + 1]; // Move to the next status
  }

  res.json({ success: true, order });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
