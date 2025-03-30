const puppeteer = require("puppeteer");

// ✅ Function to Place Order on Supplier Website
const placeSupplierOrder = async (supplierUrl, orderDetails) => {
  console.log(`🚀 Starting order placement at: ${supplierUrl}`);

  const browser = await puppeteer.launch({ headless: false }); // Change to true for production
  const page = await browser.newPage();

  try {
    await page.goto(supplierUrl, { waitUntil: "networkidle2" });

    // 🛒 Select product (Modify this based on supplier's website structure)
    await page.click("button.add-to-cart");

    // ➡️ Proceed to Checkout
    await page.click("a.checkout-button");

    // 📝 Fill Checkout Form (Modify selectors as needed)
    await page.type("#email", orderDetails.email);
    await page.type("#shipping-address", "123 Test Street, New York");
    await page.type("#payment-method", "Visa 4111 1111 1111 1111");

    // ✅ Place Order
    await page.click("button.place-order");

    console.log("✅ Order placed successfully!");

    await browser.close();
    return { success: true };
  } catch (error) {
    console.error("❌ Order placement failed:", error.message);
    await browser.close();
    return { success: false, error: error.message };
  }
};

module.exports = placeSupplierOrder;
