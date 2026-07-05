const asyncHandler = require("../utils/asyncHandler");

/**
 * @route   POST /api/upload
 * @access  Private/Admin
 * Accepts a single file under the field name "file" (see uploadRoutes.js,
 * which applies the multer middleware before this runs). Returns the public
 * path the frontend/admin panel should store on the product (media/avatar).
 */
const uploadSingleFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file was uploaded." });
  }

  const publicUrl = `/uploads/${req.file.filename}`;

  res.status(201).json({
    message: "File uploaded successfully.",
    url: publicUrl,
    type: req.file.mimetype.startsWith("video") ? "video" : "image",
  });
});

/**
 * @route   POST /api/upload/multiple
 * @access  Private/Admin
 * Accepts multiple files under the field name "files" (max 10, enforced by
 * the multer config in middleware/upload.js). Used for a product's full
 * media gallery in one request.
 */
const uploadMultipleFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files were uploaded." });
  }

  const uploaded = req.files.map((file) => ({
    url: `/uploads/${file.filename}`,
    type: file.mimetype.startsWith("video") ? "video" : "image",
  }));

  res
    .status(201)
    .json({
      message: `${uploaded.length} file(s) uploaded successfully.`,
      files: uploaded,
    });
});

module.exports = { uploadSingleFile, uploadMultipleFiles };
