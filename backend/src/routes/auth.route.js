const express = require("express");
const { login } = require("../controller/auth.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const roleMiddleware = require("../middleware/role.middleware.js");

const router = express.Router();

router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

router.get(
  "/admin-test",
  authMiddleware,
  roleMiddleware('ADMIN'),
  (req, res) => {
    res.json({
      success: true,
      message: "You are an admin",
    });
  }
);


module.exports = router;