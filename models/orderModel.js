const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  painting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Painting',
    required: [true, 'Order must belong to a painting'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'Order must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

orderSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'painting',
    select: 'name',
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
