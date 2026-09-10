const express = require("express");

const {
  getActiveAdController,
} = require("../controller/public.controller.js");

const router = express.Router();

router.get(
  "/ad",
  getActiveAdController
);

module.exports = router;