const stripe = require('stripe')(process.env.STRIPE_SECRETKEY);
const Painting = require('../models/paintingModel');
const Order = require('../models/orderModel');
const CustomPainting = require('../models/customPaintingModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./../Controllers/handlerFactory');
const User = require('./../models/userModel');
exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  try {
    const painting = await Painting.findById(req.params.paintingId);

    if (!painting) {
      return next(new AppError('No painting found with that ID', 404));
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?painting=${req.params.paintingId}&user=${req.user.id}&price=${painting.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/painting/${painting.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.paintingId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${painting.name} Painting`,
              description: `${painting.summary}`,
              images: [
                'https://artlogic-res.cloudinary.com/w_1600,h_1600,c_limit,f_auto,fl_lossy,q_auto/ws-dawsoncolecm/usr/images/artworks/main_image/items/50/500ce18c55f84568bd2411b182d3d282/larisa-safaryan_violet-echos.jpg',
              ],
            },
            unit_amount: painting.price * 100,
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
    console.error('Stripe Checkout Session Error:', error);
    next(new AppError('Failed to create checkout session', 500));
  }
});

exports.createOrderCheckout = catchAsync(async (req, res, next) => {
  const { painting, user, price } = req.query;
  if (!painting && !user && !price) return next();
  await Order.create({ painting, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find();

  if (!orders) {
    return res.status(404).json({
      status: 'fail',
      message: 'No orders found',
    });
  }

  res.status(200).json({
    status: 'success',
    result: orders.length,
    data: {
      orders,
    },
  });
});

exports.createOrder = catchAsync(async (req, res, next) => {
  const { painting, user, price } = req.body;
  if (!painting || !user || !price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Painting ID, user ID, and price are required.',
    });
  }
  try {
    const newOrder = await Order.create({
      painting,
      user,
      price,
    });
    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder,
      },
    });
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create order. Please try again later.',
    });
  }
});

exports.getOrder = factory.getOne(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
