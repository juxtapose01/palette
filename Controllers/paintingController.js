const mongoose = require('mongoose');
const Painting = require('../models/paintingModel');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const User = require('../models/userModel');
const factory = require('./../Controllers/handlerFactory');

exports.aliasAffordablePaintings = (req, res, next) => {
  req.query.sort = 'brushTime,price';
  req.query.limit = '5';
  req.query.fields = 'brushTime,name,price,difficulty';
  next();
};

exports.getAllPaintings = catchAsync(async (req, res, next) => {
  const getAllPaintings = async (req, res, next) => {
    try {
      const baseQuery = Painting.find();

      // Filter submissions based on user role
      let modifiedQuery = baseQuery;

      if (
        req.user.role !== 'admin' &&
        req.user.role !== 'artist' &&
        req.user.role !== 'vip'
      ) {
        modifiedQuery = modifiedQuery
          .find({
            submissionStatus: 'Approved',
            accessLevel: 'user',
            createdBy: ['admin', 'artist'],
          })
          .select(
            '-accessLevel -submissionDate -approvalDate -rejectionReason -submissionStatus'
          );
      } else if (
        req.user.role !== 'user' &&
        req.user.role !== 'artist' &&
        req.user.role !== 'admin'
      ) {
        modifiedQuery = modifiedQuery
          .find({
            submissionStatus: 'Approved',
            accessLevel: ['vip', 'user'],
            createdBy: ['admin', 'artist'],
          })
          .select(
            '-accessLevel -submissionDate -approvalDate -rejectionReason -submissionStatus'
          );
      } else if (
        req.user.role !== 'user' &&
        req.user.role !== 'vip' &&
        req.user.role !== 'admin'
      ) {
        modifiedQuery = modifiedQuery
          .find({
            submissionStatus: 'Approved',
            accessLevel: ['artist', 'user'],
            createdBy: ['admin', 'artist'],
          })
          .select(
            '-accessLevel -submissionDate -approvalDate -rejectionReason -submissionStatus'
          );
      }

      const features = new APIFeatures(baseQuery, req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      // const paintings = await features.query.explain();
      const paintings = await features.query;
      res.status(200).json({
        status: 'success',
        results: paintings.length,
        data: {
          paintings,
        },
      });
    } catch (error) {
      // Handle any errors
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  };

  await getAllPaintings(req, res, next);
});

exports.createPainting = catchAsync(async (req, res, next) => {
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

  // Create the painting with the converted artist IDs
  const newPainting = await Painting.create({ ...req.body, artist: artistIds });

  res.status(201).json({
    status: 'success',
    data: {
      painting: newPainting,
    },
  });
});

exports.updatePainting = factory.updateOne(Painting);

exports.deletePainting = factory.deleteOne(Painting);

exports.getPainting = catchAsync(async (req, res, next) => {
  const painting = await Painting.findById(req.params.id).populate({
    path: 'reviews',
    select: 'review rating user createdAt',
  });

  if (!painting) {
    return next(new AppError('No painting found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      painting,
    },
  });
});

exports.getPaintingStats = catchAsync(async (req, res, next) => {
  const stats = await Painting.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { medium: '$medium', difficulty: '$difficulty' },
        totalPaintings: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgBrushTime: { $avg: '$brushTime' },
      },
    },
  ]);
  res.status(200).json({
    message: 'success',
    data: {
      stats,
    },
  });
});
