const express = require("express");

const {
  createImpressionController,
  createClickController,
} = require("../controller/event.controller.js");

const router = express.Router();

router.post(
  "/impression",
  createImpressionController
);

router.post(
  "/click",
  createClickController
);

module.exports = router;