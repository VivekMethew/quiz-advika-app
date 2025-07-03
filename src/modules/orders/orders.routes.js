const express = require("express");
const ordersController = require("./orders.controller");
const router = express.Router();

router.post("/checkout", ordersController.checkout);
router.post("/addOnCheckout", ordersController.addOnCheckout);
router.get("/list", ordersController.getMyOrders);
router.delete("/delete/:id", ordersController.deleteMyOrders);

router.post("/copyProduct", ordersController.copyProduct);

module.exports = router;
