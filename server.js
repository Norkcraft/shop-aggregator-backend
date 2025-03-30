require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY; // ✅ Use environment variable

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ✅ Amazon Product Scraper Route
app.get("/api/amazon", async (req, res) => {
  try {
    const query = req.query.q;
    const page = req.query.page || 1; // Pagination support
    if (!query) return res.status(400).json({ error: "Query is required" });

    // ✅ Correct ScraperAPI URL with API Key & Proper Formatting
    const apiUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&autoparse=true&url=https://www.amazon.com/s?k=${query}&page=${page}`;

    // ✅ Make request with headers to avoid detection
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });

    // ✅ Check if products exist in response
    if (!response.data || !response.data.products || response.data.products.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    // ✅ Extract and format product data
    const products = response.data.products.map((product) => ({
      title: product.title || "No title",
      price: product.price ? product.price.replace(/[^0-9.]/g, "") : "N/A", // ✅ Ensure numeric price
      image: product.image || "https://via.placeholder.com/150",
      link: product.url || "#",
      rating: product.rating || "N/A"
    }));

    res.json({ success: true, products, page });
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});