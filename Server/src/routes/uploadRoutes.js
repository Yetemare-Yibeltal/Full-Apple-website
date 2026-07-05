const express = require("express");

const {
  uploadSingleFile,
  uploadMultipleFiles,
} = require("../controllers/uploadController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

// Every upload route is admin-only
router.use(protect, authorize("admin"));

router.post("/", upload.single("file"), uploadSingleFile);
router.post("/multiple", upload.array("files", 10), uploadMultipleFiles);

module.exports = router;
