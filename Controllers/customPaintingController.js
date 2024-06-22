const mongoose = require('mongoose');
const customPainting = require('../models/customPaintingModel');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadCustomPaintingImages = upload.fields([
  { name: 'shoeImages', maxCount: 1 },
  { name: 'OtherShoeImages', maxCount: 3 },
]);

exports.resizeCustomPaintingImages = catchAsync(async (req, res, next) => {
  if (!req.files.shoeImages && !req.files.OtherShoeImages) return next();

  // Resize cover image
  if (req.files.shoeImages) {
    req.body.shoeImages = `custom-painting-${req.params.id}-${Date.now()}-shoeCover.jpeg`;
    await sharp(req.files.shoeImages[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/custom_paintings/${req.body.shoeImages}`);
  }

  // Resize other images
  if (req.files.OtherShoeImages) {
    req.body.OtherShoeImages = [];
    await Promise.all(
      req.files.OtherShoeImages.map(async (file, i) => {
        const filename = `custom-paintings-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/custom_paintings/${filename}`);
        req.body.OtherShoeImages.push(filename);
      })
    );
  }

  next();
});

exports.getAllCustomPaintings = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    customPainting.find().populate('artist'),
    req.query
  )
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
    .populate({
      path: 'reviews',
      select: 'review rating user createdAt',
    });
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
