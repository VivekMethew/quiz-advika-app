const express = require("express");
const router = express.Router();
const filesController = require("./files.controller");
const { uploadFile } = require("../../middlewares/upload.files");

router.post("/bucket", uploadFile, filesController.uploadBucketNew);
router.post("/bucket2", filesController.uploadBucket);

module.exports = router;
