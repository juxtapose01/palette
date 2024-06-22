const express = require('express');
const router = express.Router();
const viewController = require('./../Controllers/viewController');
const authController = require('./../Controllers/authController');
const orderController = require('./../Controllers/orderController');
const customOrderController = require('./../Controllers/customOrderController');

//Route to render the overview page

router.get(
  '/',
  (req, res, next) => {
    next();
  },
  orderController.createOrderCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get(
  '/custom-painting-on-shoes',
  (req, res, next) => {
    next();
  },
  authController.isLoggedIn,
  customOrderController.createCustomOrderCheckout,
  viewController.getCustomOverview
);

router.get(
  '/painting/:slug',
  authController.isLoggedIn,
  viewController.getPainting
);

router.get(
  '/custom-painting-on-shoes/:slug',
  authController.isLoggedIn,
  viewController.getCustomPainting
);

router.get('/login', authController.isLoggedIn, viewController.getLoginForm);

router.get('/me', authController.protect, viewController.getAccountDetails);

router.get('/my-orders', authController.protect, viewController.getMyOrders);
router.get(
  '/my-custom-orders',
  authController.protect,
  viewController.getMyCustomOrders
);

router.get('/forgotPassword', viewController.getForgotPassword);
router.get('/resetPassword/:token', viewController.getResetPassword);

router.get('/signup', viewController.getSignUpForm);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
