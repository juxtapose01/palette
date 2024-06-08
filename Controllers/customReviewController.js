const customReview = require('./../models/customReviewModal');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

const factory = require('./handlerFactory');

exports.getAllCustomReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.customPaintingId)
    filter = { painitng: req.params.customPaintingId };

  const Reviews = await customReview.find(filter);

  res.status(200).json({
    status: 'success',
    results: Reviews.length,
    data: {
      Reviews,
    },
  });
});

exports.createCustomReviewsOnPaintings = catchAsync(async (req, res, next) => {
  console.log('Custom Painting ID:', req.params.customPaintingId);
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
