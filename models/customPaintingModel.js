const mongoose = require('mongoose');
const slugify = require('slugify');

const customPaintingSchema = new mongoose.Schema({
  shoeType: {
    type: String,
    required: [true, 'A shoe type must be mentioned'],
    enum: [
      'Converse Chuck Taylor All Star',
      'Nike Air Force 1',
      'Vans Classic Slip-On',
      'Adidas UltraBoost',
      'Air Jordan 1',
    ],
  },
  slug: String,
  shoeSize: {
    type: String,
    required: true,
  },
  pricePerPair: {
    type: Number,
    required: true,
  },
  priceDiscountOnShoes: {
    type: Number,
    validate: {
      validator: function (val) {
        // this only points to current doc on NEW document creation
        return val < this.pricePerPair;
      },
      message: 'Discount price ({VALUE}) should be below regular price',
    },
  },
  shoeImages: [String],
  otherDetails: {
    type: String,
    trim: true,
    required: [true, 'A custom painting must mention details'],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: (val) => Math.round(val * 10) / 10,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A custom painting must have a description'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A custom painting must have a description'],
  },
  artist: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  review: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Review',
    },
  ],
});

customPaintingSchema.index({ pricePerPair: 1, ratingsAverage: -1 });
customPaintingSchema.index({ slug: 1 });

customPaintingSchema.virtual('customReview', {
  ref: 'customReview',
  foreignField: 'customPainting',
  localField: '_id',
});

customPaintingSchema.set('toObject', { virtuals: true });
customPaintingSchema.set('toJSON', { virtuals: true });

// Document middleware: runs before .save() and .create()
customPaintingSchema.pre('save', function (next) {
  this.slug = slugify(this.shoeType, { lower: true });
  next();
});

// Query middleware
customPaintingSchema.pre(/^find/, function (next) {
  next();
});

customPaintingSchema.post(/^find/, function (docs, next) {
  next();
});

customPaintingSchema.pre('aggregate', function (next) {
  next();
});

const CustomPainting = mongoose.model('CustomPainting', customPaintingSchema);

module.exports = CustomPainting;
