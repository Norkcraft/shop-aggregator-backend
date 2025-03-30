const express = require("express");
const router = express.Router();
const axios = require("axios");

let orders = []; // Temporary storage (use a database in production)

// 📌 Place an order
router.post("/", async (req, res) => {
  try {
    const { userId, productId, quantity, shippingAddress } = req.body;
    if (!userId || !productId || !quantity || !shippingAddress) {
      return res.status(400).json({ error: "Missing order details" });
    }

    // 📌 Fetch product details from supplier API
    const productResponse = await axios.get(`https://fakestoreapi.com/products/${productId}`);
    const product = productResponse.data;

    if (!product) return res.status(404).json({ error: "Product not found" });

    // 📌 Place an order on supplier's website (Fake Example)
    const supplierOrder = await axios.post("https://fakestoreapi.com/carts", {
      userId,
      date: new Date().toISOString(),
      products: [{ productId, quantity }],
    });

    // 📌 Store order locally (replace with database logic)
    const order = {
      orderId: orders.length + 1,
      userId,
      productId,
      quantity,
      totalAmount: (product.price * 1.2 * quantity).toFixed(2), // Add 20% profit
      status: "Processing",
      supplierOrderId: supplierOrder.data.id, // Supplier Order ID
      shippingAddress,
    };

    orders.push(order);
    res.json({ message: "Order placed successfully!", order });
  } catch (error) {
    console.error("Order placement failed:", error.response?.data || error.message);
    res.status(500).json({ error: "Order placement failed" });
  }
});

// 📌 Get All Orders
router.get("/", (req, res) => {
  res.json(orders);
});

module.exports = router;
