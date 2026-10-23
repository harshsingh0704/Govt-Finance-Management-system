
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const notificationController = require("../controllers/notificationController");

router.use(authMiddleware);

router.get("/", notificationController.getMyNotifications);
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

module.exports = router;
