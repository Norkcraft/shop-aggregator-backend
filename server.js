require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

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

    // ✅ ScraperAPI URL with autoparse=true & pagination
    const apiUrl = `http://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&autoparse=true&url=https://www.amazon.com/s?k=${query}&page=${page}`;

    // ✅ Make the request with User-Agent header
    const response = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
      }
    });

    // ✅ Check if we got results
    if (!response.data || !response.data.results || response.data.results.length === 0) {
      return res.status(404).json({ error: "No products found" });
    }

    // ✅ Format the product data with filtering support
    const products = response.data.results
      .map((product) => ({
        title: product.title,
        price: typeof product.price === "string" ? product.price.replace(/[^0-9.]/g, "") : "N/A", // ✅ Ensure price is a string before replacing
        image: product.image,
        link: product.url,
        rating: product.rating || "N/A"
      }))
      .filter(product => product.price !== "N/A" && product.price.trim() !== ""); // ✅ Filter out empty prices

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
