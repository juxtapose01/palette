const mongoose = require('mongoose');
const Painting = require('./../models/paintingModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
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
    painting: {
      type: mongoose.Schema.ObjectId,
      ref: 'Painting',
      required: [true, 'Review must belong to a painting.'],
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

reviewSchema.index({ painting: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calAverageRatings = async function (paintingId) {
  const stats = await this.aggregate([
    {
      $match: {
        painting: paintingId,
      },
    },
    {
      $group: {
        _id: '$painting',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Painting.findByIdAndUpdate(paintingId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Painting.findByIdAndUpdate(paintingId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  Review.calAverageRatings(this.painting);
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
