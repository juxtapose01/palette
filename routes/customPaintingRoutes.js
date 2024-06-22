const customPaintingController = require('./../Controllers/customPaintingController');
const authController = require('./../Controllers/authController');
const express = require('express');
const router = express.Router();
const customReviewRouter = require('./customReviewRoutes');

router.use('/:customPaintingId/custom-reviews', customReviewRouter);

router
  .route('/custom-painting-insights-analytics')
  .get(customPaintingController.getCustomPaintingStats);

router
  .route('/')
  .get(customPaintingController.getAllCustomPaintings)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    customPaintingController.createCustomPainting
  );

router
  .route('/:id')
  .get(customPaintingController.getCustomPainting)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    customPaintingController.uploadCustomPaintingImages,
    customPaintingController.resizeCustomPaintingImages,
    customPaintingController.updateCustomPainting
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    customPaintingController.deleteCustomPainting
  );

module.exports = router;
