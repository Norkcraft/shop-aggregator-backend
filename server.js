require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors({ origin: "*" })); // Allow all origins for now
app.use(express.json());

const PORT = process.env.PORT || 5000;
const FAKESTORE_API = "https://fakestoreapi.com/products"; // ✅ Base API URL

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ✅ Products Route (Fetch all or single product)
app.get("/api/products", async (req, res) => {
  try {
    const { q, id } = req.query;

    // 🔹 Fetch all products if no ID is provided
    if (!id) {
      const response = await axios.get(FAKESTORE_API);
      let products = response.data.map((product) => ({
        id: product.id,
        title: product.title,
        price: (parseFloat(product.price) * 1.2).toFixed(2), // ✅ 20% markup
        image: product.image,
        category: product.category,
        description: product.description,
        link: `${FAKESTORE_API}/${product.id}`, // Direct product link
      }));

      // 🔹 Filter products based on search query
      if (q) {
        products = products.filter((product) =>
          product.title.toLowerCase().includes(q.toLowerCase())
        );
      }

      return res.json({ success: true, products });
    }

    // 🔹 Fetch single product by ID
    const productResponse = await axios.get(`${FAKESTORE_API}/${id}`);
    if (!productResponse.data) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const product = {
      id: productResponse.data.id,
      title: productResponse.data.title,
      price: (parseFloat(productResponse.data.price) * 1.2).toFixed(2), // ✅ 20% markup
      image: productResponse.data.image,
      category: productResponse.data.category,
      description: productResponse.data.description,
    };

    return res.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
});

// ✅ Order Placement Route (Simulated Purchase)
app.post("/api/order", async (req, res) => {
  try {
    const { userId, productId, quantity, shippingAddress } = req.body;
    if (!userId || !productId || !quantity || !shippingAddress) {
      return res.status(400).json({ error: "Missing order details" });
    }

    // 🔹 Fetch product details
    const productResponse = await axios.get(`${FAKESTORE_API}/${productId}`);
    if (!productResponse.data) return res.status(404).json({ error: "Product not found" });

    const product = productResponse.data;

    // 🔹 Simulated order placement in FakeStoreAPI
    const supplierOrder = await axios.post("https://fakestoreapi.com/carts", {
      userId,
      date: new Date().toISOString(),
      products: [{ productId, quantity }],
    });

    // 🔹 Calculate total amount with 20% profit
    const totalAmount = (parseFloat(product.price) * 1.2 * quantity).toFixed(2);

    // 🔹 Order Response
    const order = {
      orderId: supplierOrder.data.id, // Use supplier order ID
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
    console.error("Order placement failed:", error.message);
    res.status(500).json({ error: "Order placement failed", details: error.message });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
