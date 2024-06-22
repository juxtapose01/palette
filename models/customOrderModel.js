const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
  customPainting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomPainting',
    required: [true, 'Order must belong to a custom painting'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user'],
  },
  pricePerPair: {
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

customOrderSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'customPainting',
    select: 'shoeType',
  });
  next();
});

const customOrder = mongoose.model('CustomOrder', customOrderSchema);

module.exports = customOrder;
