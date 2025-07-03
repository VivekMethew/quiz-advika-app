const express = require("express");
const categoryController = require("./category.controller");
const { validationMiddleware } = require("../../middlewares");
const { categorySchema } = require("./category.validation");
const { validateAccessToken } = require("../../middlewares/authorisation");
const { CONSTANTS } = require("../../config");

const router = express.Router();

router.post(
  "/add",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(categorySchema.category),
  categoryController.addCategory
);

router.get("/list", categoryController.getList);

router.get("/:id/view", categoryController.view);

router.patch(
  "/:id/update",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  validationMiddleware(categorySchema.update),
  categoryController.update
);

router.patch(
  "/:id/applyTrending",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  // validationMiddleware(categorySchema.updateTrending),
  categoryController.applyTrending
);

router.delete(
  "/:id/delete",
  validateAccessToken(CONSTANTS.USER.ROLES.ADMIN),
  categoryController.delete
);

module.exports = router;
