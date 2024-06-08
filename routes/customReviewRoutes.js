const express = require('express');
const router = express.Router({ mergeParams: true });
const customReviewController = require('./../Controllers/customReviewController');
const authController = require('./../Controllers/authController');

router
  .route('/')
  .get(customReviewController.getAllCustomReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    customReviewController.createCustomReviewsOnPaintings
  );
router
  .route('/:id')
  .get(customReviewController.getCustomReview)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    customReviewController.updateCustomReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    customReviewController.deleteCustomReview
  );
module.exports = router;
