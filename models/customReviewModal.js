const mongoose = require('mongoose');
const customPainting = require('./../models/customPaintingModel');
const customReviewSchema = new mongoose.Schema(
  {
    customReview: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    customPainting: {
      type: mongoose.Schema.ObjectId,
      ref: 'CustomPainting',
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user.'],
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

customReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

customReviewSchema.statics.calAverageRatings = async function (
  customPaintingId
) {
  const stats = await this.aggregate([
    {
      $match: {
        customPainting: customPaintingId,
      },
    },
    {
      $group: {
        _id: '$customPainting',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await customPainting.findByIdAndUpdate(customPaintingId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await customPainting.findByIdAndUpdate(customPaintingId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
  console.log(stats);
};

customReviewSchema.post('save', function () {
  this.constructor.calAverageRatings(this.customPainting);
});

const customReview = mongoose.model('customReview', customReviewSchema);

module.exports = customReview;
