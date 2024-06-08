const mongoose = require('mongoose');
const customPainting = require('../models/customPaintingModel');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllCustomPaintings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(customPainting.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const customPaintings = await features.query;

  res.status(200).json({
    status: 'success',
    results: customPaintings.length,
    data: {
      customPaintings,
    },
  });
});

exports.createCustomPainting = catchAsync(async (req, res, next) => {
  let artistIds = req.body.artist;

  // Check if artistIds is an array and each element is a valid ObjectId
  if (
    !Array.isArray(artistIds) ||
    artistIds.some((id) => !mongoose.Types.ObjectId.isValid(id))
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid artist IDs provided',
    });
  }

  // Convert artist IDs to ObjectId
  artistIds = artistIds.map((artistId) => mongoose.Types.ObjectId(artistId));
  const newCustomPainting = await customPainting.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      customPainting: newCustomPainting,
    },
  });
});

exports.getCustomPainting = catchAsync(async (req, res, next) => {
  const customPaintings = await customPainting
    .findById(req.params.id)
    .populate('reviews');
  res.status(201).json({
    status: 'success',
    data: {
      customPainting: customPaintings,
    },
  });
});

exports.updateCustomPainting = factory.updateOne(customPainting);

exports.deleteCustomPainting = factory.deleteOne(customPainting);

exports.getCustomPaintingStats = catchAsync(async (req, res, next) => {
  const customstats = await customPainting.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { shoeType: '$shoeType' },
        totalCustomPaintings: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$pricePerPair' },
        minPrice: { $min: '$pricePerPair' },
        maxPrice: { $max: '$pricePerPair' },
      },
    },
  ]);
  res.status(200).json({
    message: 'success',
    data: {
      customstats,
    },
  });
});
