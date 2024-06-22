const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');
const authController = require('./../Controllers/authController');

router.get(
  '/checkout-session/:paintingId',
  authController.protect,
  orderController.getCheckoutSession
);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    orderController.getAllOrders
  );

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    orderController.createOrder
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    orderController.getOrder
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    orderController.deleteOrder
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    orderController.updateOrder
  );

module.exports = router;
