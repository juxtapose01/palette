const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');

const Review = require('./../models/reviewModal');
const factory = require('./handlerFactory');
const Painting = require('./../models/paintingModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.paintingId) filter = { painitng: req.params.paintingId };

  const Reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: Reviews.length,
    data: {
      Reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.painitng) req.body.painitng = req.params.paintingId;
  if (!req.body.user) req.body.user = req.user.id;

  const painting = await Painting.findById(req.body.painting);
  if (!painting) {
    return next(new AppError('No painting found with that ID', 404));
  }

  if (req.user.role === 'user' && !painting.accessLevel.includes('user')) {
    return next(
      new AppError('You do not have permission to review this painting', 403)
    );
  }

  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.getReview = factory.getOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
