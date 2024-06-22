const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);

const CustomOrder = require('../models/customOrderModel');

const CustomPainting = require('../models/customPaintingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./../Controllers/handlerFactory');

exports.getCheckoutSessionCustomPainting = catchAsync(
  async (req, res, next) => {
    try {
      const customPaint = await CustomPainting.findById(
        req.params.customPaintingId
      );

      if (!customPaint) {
        return next(new AppError('No custom painting found with that ID', 404));
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/custom-painting-on-shoes?customPaint=${req.params.customPaintingId}&user=${req.user.id}&price=${customPaint.pricePerPair}`,
        cancel_url: `${req.protocol}://${req.get('host')}/custom-paintings/${customPaint.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.customPaintingId,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${customPaint.shoeType} Shoes`,
                description: `${customPaint.summary}`,
                images: [
                  'https://artlogic-res.cloudinary.com/w_1600,h_1600,c_limit,f_auto,fl_lossy,q_auto/ws-dawsoncolecm/usr/images/artworks/main_image/items/50/500ce18c55f84568bd2411b182d3d282/larisa-safaryan_violet-echos.jpg',
                ],
              },
              unit_amount: customPaint.pricePerPair * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
      });

      res.status(200).json({
        status: 'success',
        session,
      });
    } catch (error) {
      console.error('Stripe Checkout Session Custom Painting Error:', error);
      next(
        new AppError(
          'Failed to create checkout session for custom painting',
          500
        )
      );
    }
  }
);

exports.createCustomOrderCheckout = catchAsync(async (req, res, next) => {
  const { customPaint, user, price } = req.query;

  // Check if required parameters are present
  if (!customPaint || !user || !price) {
    console.log('Missing required parameters');
    return next();
  }

  try {
    const newOrder = await CustomOrder.create({
      customPainting: customPaint,
      user: user,
      pricePerPair: price,
    });
    res.redirect('/custom-painting-on-shoes'); // Adjust this to match your route configuration
  } catch (error) {
    next(new AppError('Failed to create custom order', 500));
  }
});

exports.getAllCustomOrders = catchAsync(async (req, res, next) => {
  const customOrders = await CustomOrder.find();

  if (!customOrders) {
    return res.status(404).json({
      status: 'fail',
      message: 'No orders found',
    });
  }

  res.status(200).json({
    status: 'success',
    result: customOrders.length,
    data: {
      customOrders,
    },
  });
});

exports.createCustomOrder = catchAsync(async (req, res, next) => {
  const { shoeType, pricePerPair, shoeSize } = req.body;

  if (!shoeType || !pricePerPair || !shoeSize) {
    return res.status(400).json({
      status: 'fail',
      message:
        'shoeType, pricePerPair, and shoeSize are required for custom orders.',
    });
  }
  try {
    const newOrder = await CustomOrder.create({
      shoeType,
      pricePerPair,
      shoeSize,
    });
    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
      },
    });
  } catch (err) {
    console.error('Error creating custom order:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create custom order. Please try again later.',
    });
  }
});

exports.getCustomOrder = factory.getOne(CustomOrder);
exports.updateCustomOrder = factory.updateOne(CustomOrder);
exports.deleteCustomOrder = factory.deleteOne(CustomOrder);
