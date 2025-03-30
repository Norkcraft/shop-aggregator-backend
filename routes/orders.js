const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { body, param, validationResult } = require("express-validator");
const axios = require("axios");
require("dotenv").config();

// ✅ Connect to Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ✅ Middleware to Verify Auth Token
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer Token
    if (!token) return res.status(401).json({ success: false, error: "Unauthorized: No token provided" });

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ success: false, error: "Unauthorized: Invalid token" });

    req.user = data.user;
    next(); // Proceed to the next middleware
};

// 🔹 1️⃣ Fetch All Orders (Requires Auth)
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase.from("orders").select("*").eq("user_id", req.user.id);
        if (error) throw error;

        res.status(200).json({ success: true, orders: data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch orders", error: error.message });
    }
});

// 🔹 2️⃣ Fetch Single Order (Requires Auth)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from("orders").select("*").eq("id", id).eq("user_id", req.user.id).single();
        if (error || !data) return res.status(404).json({ success: false, error: "Order not found" });

        res.status(200).json({ success: true, order: data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch order", error: error.message });
    }
});

// 🔹 3️⃣ Place an Order (Requires Auth)
router.post(
    "/",
    authMiddleware,
    [
        body("productId").isInt({ min: 1 }).withMessage("Product ID must be a valid number"),
        body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { productId, quantity } = req.body;

            // ✅ Fetch Product from API
            const productResponse = await axios.get(`https://fakestoreapi.com/products/${productId}`);
            if (!productResponse.data) {
                return res.status(404).json({ success: false, error: "Product not found" });
            }

            const product = productResponse.data;

            // ✅ Save order in Supabase (store user_id instead of email)
            const { data, error } = await supabase.from("orders").insert([
                {
                    product_id: productId,
                    quantity,
                    user_id: req.user.id, // Store user_id
                    status: "Pending",
                },
            ]);

            if (error) throw error;

            res.status(201).json({ success: true, message: "Order placed successfully!", product, data });
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to place order", error: error.message });
        }
    }
);

// 🔹 4️⃣ Update Order Status (Requires Auth)
router.put(
    "/:id",
    authMiddleware,
    [
        param("id").isInt().withMessage("Order ID must be a valid number"),
        body("status").isIn(["Pending", "Shipped", "Delivered", "Cancelled"]).withMessage("Invalid status"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const { status } = req.body;

            // ✅ Update only if the order belongs to the logged-in user
            const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).eq("user_id", req.user.id);
            if (error) throw error;

            res.status(200).json({ success: true, message: "Order updated successfully!", updatedOrder: data });
        } catch (error) {
            res.status(500).json({ success: false, message: "Failed to update order", error: error.message });
        }
    }
);

// 🔹 5️⃣ Delete Order (Requires Auth)
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Delete only if the order belongs to the logged-in user
        const { error } = await supabase.from("orders").delete().eq("id", id).eq("user_id", req.user.id);
        if (error) throw error;

        res.status(200).json({ success: true, message: "Order deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete order", error: error.message });
    }
});

module.exports = router;
