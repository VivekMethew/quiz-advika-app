const express = require("express");
const CONTROLLER = require("./controller");
const router = express.Router();

router.get("/:key/video", CONTROLLER.STREAM);

module.exports = router;
