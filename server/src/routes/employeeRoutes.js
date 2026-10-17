
const express = require("express");
const multer = require("multer");

const router = express.Router();
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Employee routes are working",
  });
});
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/authMiddleware");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowed = /\.(xlsx|xls)$/i.test(file.originalname);

    if (!allowed) {
      return callback(new Error("Only .xlsx and .xls files are allowed."));
    }

    callback(null, true);
  },
});

router.get("/", authMiddleware, employeeController.getAllEmployees);
router.post("/", authMiddleware, employeeController.createEmployee);

router.post(
  "/bulk-import",
  authMiddleware,
  (req, res, next) => {
    const role = String(req.user?.role || "").toLowerCase();

    if (!["admin", "super admin", "super_admin"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only Admin or Super Admin can bulk import employees.",
      });
    }

    next();
  },
  upload.single("file"),
  employeeController.bulkImportEmployees
);

module.exports = router;
