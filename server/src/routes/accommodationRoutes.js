const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const accommodationController = require("../controllers/accommodationController");

router.post("/", authMiddleware, accommodationController.createAccommodation);
router.get("/mine", authMiddleware, accommodationController.getMyAccommodations);

module.exports = router;
