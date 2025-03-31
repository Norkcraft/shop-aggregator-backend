require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // ✅ Use environment variable

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ✅ Amazon Product Scraper Route (Using RapidAPI)
app.get("/api/amazon", async (req, res) => {
  try {
    const query = req.query.q;
    const page = req.query.page || 1;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // ✅ RapidAPI URL
    const apiUrl = `https://real-time-amazon-data.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&country=US&sort_by=RELEVANCE&product_condition=ALL&is_prime=false&deals_and_discounts=NONE`;

    // ✅ API Request
    const response = await axios.get(apiUrl, {
      headers: {
        "x-rapidapi-host": "real-time-amazon-data.p.rapidapi.com",
        "x-rapidapi-key": RAPIDAPI_KEY, // ✅ Use environment variable
      },
    });

    // ✅ Extract and format product data
    const products = response.data.data.map((product) => ({
      title: product.title || "No title",
      price: product.price ? product.price.value : "N/A",
      image: product.main_image || "https://via.placeholder.com/150",
      link: product.detail_page_url || "#",
      rating: product.rating ? `${product.rating} stars` : "No rating",
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
