const express = require('express');
const router = express.Router();

const paintController = require('./../Controllers/paintingController');
const authController = require('./../Controllers/authController');

const reviewRouter = require('./reviewRoutes');

router.use(authController.protect);

// router
//   .route('/:paintingId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
router.use('/:paintingId/reviews', reviewRouter);
router
  .route('/top-5-affordable-art-pieces')
  .get(
    paintController.aliasAffordablePaintings,
    paintController.getAllPaintings
  );

router
  .route('/painting-insights-analytics')
  .get(paintController.getPaintingStats);

router
  .route('/')
  .get(paintController.getAllPaintings)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    paintController.createPainting
  );

router
  .route('/:id')
  .get(paintController.getPainting)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'artist'),
    paintController.updatePainting
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    paintController.deletePainting
  );

module.exports = router;
