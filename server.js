const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const products = [
  { id: "1", title: "Product 1", price: 10, image: "https://via.placeholder.com/100", description: "Description 1" },
  { id: "2", title: "Product 2", price: 20, image: "https://via.placeholder.com/100", description: "Description 2" },
];

app.get("/products", (req, res) => {
  res.json({ success: true, products });
});

app.get("/products/:id", (req, res) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  res.json({ success: true, product });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));