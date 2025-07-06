const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../public/upload")),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-games${path.extname(file.originalname)}`),
});

const fileFilterExcel = (req, file, cb) => {
  const allowedTypes = [".xlsx", ".xls"];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowedTypes.includes(ext));
};

const uploadBuilkUpload = multer({ storage, fileFilter: fileFilterExcel });

module.exports = { uploadBuilkUpload };
