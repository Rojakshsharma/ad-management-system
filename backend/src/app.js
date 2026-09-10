const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route.js");
const adSpaceRoutes = require("./routes/adSpace.routes");
const pricingRuleRoutes = require("./routes/pricingRule.routes.js");
const adRoutes = require("./routes/ad.routes.js");
const adminAdRoutes = require("./routes/adminAd.routes.js");
const placementRoutes = require("./routes/placement.routes.js");
const orderRoutes = require("./routes/order.routes.js");
const publicRoutes = require("./routes/public.routes.js");
const eventRoutes = require("./routes/event.routes.js");
const analyticsRoutes = require("./routes/analytics.routes.js");

const app = express();

app.use(cors());
app.use(express.json());



app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Ad Management API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/ad-spaces", adSpaceRoutes);
app.use("/api/admin/pricing-rules", pricingRuleRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/admin/ads", adminAdRoutes);
app.use("/api/placements", placementRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/public/events", eventRoutes);
app.use("/api/analytics", analyticsRoutes);

module.exports = app;