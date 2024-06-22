const customReview = require('./../models/customReviewModal');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const mongoose = require('mongoose');

const factory = require('./handlerFactory');

exports.getAllCustomReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.customPaintingId)
    filter = { painting: req.params.customPaintingId };

  const reviews = await customReview.find(filter).populate('user', 'reviews');

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createCustomReviewsOnPaintings = catchAsync(async (req, res, next) => {
  console.log('User ID:', req.user.id);

  if (!req.body.customPainting)
    req.body.customPainting = mongoose.Types.ObjectId(
      req.params.customPaintingId
    );
  if (!req.body.user) req.body.user = mongoose.Types.ObjectId(req.user.id);

  console.log('Updated Request Body:', req.body);

  const review = await customReview.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getCustomReview = factory.getOne(customReview);

exports.updateCustomReview = factory.updateOne(customReview);

exports.deleteCustomReview = factory.deleteOne(customReview);
