const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const paintingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A painting must have a name'],
    unique: true,
    trim: true,
    maxlength: [
      40,
      'A painting name must have less or equal than 40 characters',
    ],
    minlength: [
      10,
      'A painting name must have more or equal than 10 characters',
    ],
  },
  slug: String,
  medium: {
    type: String,
    trim: true,
    required: [true, 'A painting must have a medium'],
  },
  otherDetails: {
    type: String,
    trim: true,
    required: [true, 'A painting must mention details'],
  },
  dimensions: {
    type: String,
    trim: true,
    required: [true, 'A painting must have dimensions'],
  },
  brushTime: {
    type: Number,
    required: [true, 'Brush time must be provided'],
  },
  difficulty: {
    type: String,
    required: [true, 'A painting must have a difficulty'],
    enum: {
      values: ['Beginner', 'Intermediate', 'Advanced'],
      message: 'Difficulty is either: Beginner, Intermediate, Advanced',
    },
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
  price: {
    type: Number,
    required: [true, 'A painting must have a price'],
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        // this only points to current doc on NEW document creation
        return val < this.price;
      },
      message: 'Discount price ({VALUE}) should be below regular price',
    },
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A painting must have a description'],
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'A painting must have a description'],
  },
  imageCover: {
    type: String,
    required: [true, 'A painting must have a cover image'],
  },
  images: [String],
  accessLevel: {
    type: String,
    enum: ['user', 'vip', 'artist', 'admin'],
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  submissionStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
  },
  submissionDate: {
    type: Date,
  },
  approvalDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
    validate: {
      validator: function (v) {
        // `this` is the document being validated
        return (
          this.submissionStatus !== 'Rejected' ||
          (this.submissionStatus === 'Rejected' && v != null && v.length > 0)
        );
      },
      message: 'A rejection must have a reason',
    },
  },
  category: {
    type: 'String',
    required: [true, 'A painting must have a category'],
    enum: ['landscape', 'portrait'],
  },
  createdBy: {
    type: String,
    required: [true],
    default: 'artist',
    message:
      'This exquisite painting was crafted by our esteemed and renowned artist, [artists name]',
  },
  artist: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  review: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Review',
    },
  ],
});

paintingSchema.index({ price: 1, ratingsAverage: -1 });
paintingSchema.index({ slug: 1 });
//VirtualPopulate
paintingSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'painting',
  localField: '_id',
});

paintingSchema.set('toObject', { virtuals: true });
paintingSchema.set('toJSON', { virtuals: true });

// Document middleware: runs before .save() and .create()
paintingSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });

  if (this.artist && Array.isArray(this.artist)) {
    this.artist = this.artist.map((artistId) => {
      try {
        return mongoose.Types.ObjectId(artistId);
      } catch (err) {
        return next(new Error(`Invalid artist ID format: ${artistId}`));
      }
    });
  }

  next();
});

// Query middleware
paintingSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'artist',
    select: '-__v -passwordChangedAt',
  });
  next();
});

const Painting = mongoose.model('Painting', paintingSchema);

module.exports = Painting;
