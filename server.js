require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "*", // allow all origins for testing; you may restrict this later
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ✅ Products Route (Using Fakestore API with 20% profit margin)
app.get("/api/products", async (req, res) => {
  try {
    const query = req.query.q || "";
    
    // Fetch products from Fakestore API
    const response = await axios.get("https://fakestoreapi.com/products");
    let products = response.data; // this should be an array

    // Add 20% profit margin to each product's price
    products = products.map((product) => ({
      ...product,
      price: (parseFloat(product.price) * 1.2).toFixed(2),
    }));

    // If a search query is provided, filter products by title (case-insensitive)
    if (query) {
      const lowerQuery = query.toLowerCase();
      products = products.filter((product) =>
        product.title.toLowerCase().includes(lowerQuery)
      );
    }

    res.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
});

// (Optional) Order Purchase Simulation Route
// This route simulates placing an order to a supplier.
// You can expand this logic later for real order automation.
app.post("/api/order", async (req, res) => {
  try {
    const { userId, productId, quantity, shippingAddress } = req.body;
    if (!userId || !productId || !quantity || !shippingAddress) {
      return res.status(400).json({ error: "Missing order details" });
    }

    // Fetch product details from Fakestore API
    const productResponse = await axios.get(`https://fakestoreapi.com/products/${productId}`);
    const product = productResponse.data;
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Simulate placing an order on the supplier's website (Fakestore API example)
    const supplierOrder = await axios.post("https://fakestoreapi.com/carts", {
      userId,
      date: new Date().toISOString(),
      products: [{ productId, quantity }],
    });

    // Calculate the total amount with a 20% profit margin
    const totalAmount = (parseFloat(product.price) * 1.2 * quantity).toFixed(2);

    // Build an order object to return
    const order = {
      orderId: supplierOrder.data.id, // use the supplier order ID as our order ID
      userId,
      productId,
      quantity,
      totalAmount,
      status: "Processing",
      shippingAddress,
    };

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    console.error("Order placement failed:", error.response?.data || error.message);
    res.status(500).json({
      error: "Order placement failed",
      details: error.response?.data || error.message,
    });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
