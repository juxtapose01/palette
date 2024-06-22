const express = require('express');
const router = express.Router();
const customOrderController = require('./../Controllers/customOrderController');
const authController = require('../Controllers/authController');

router.get(
  '/checkout-session-shoe/:customPaintingId',
  authController.protect,
  customOrderController.getCheckoutSessionCustomPainting
);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    customOrderController.getAllCustomOrders
  );

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    customOrderController.createCustomOrder
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    customOrderController.getCustomOrder
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    customOrderController.deleteCustomOrder
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    customOrderController.updateCustomOrder
  );

module.exports = router;
