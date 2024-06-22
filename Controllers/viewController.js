const Painting = require('./../models/paintingModel');
const catchAsync = require('./../utils/catchAsync');
const CustomPainting = require('./../models/customPaintingModel');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Order = require('./../models/orderModel');
const CustomOrder = require('./../models/customOrderModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  const paintings = await Painting.find();

  res.status(200).render('overview', {
    paintings,
    artworkUrl: '/',
  });
});

exports.getPainting = catchAsync(async (req, res, next) => {
  const painting = await Painting.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!painting) {
    return next(new AppError('No painting found with that name', 404));
  }

  res.status(200).render('painting', {
    painting,
  });
});

exports.getCustomOverview = catchAsync(async (req, res, next) => {
  const customPaints = await CustomPainting.find().populate(
    'artist',
    'name -_id'
  );
  customPaints.forEach((paint) => {
    if (Array.isArray(paint.artist)) {
      paint.artist.forEach((artist) => {
        if (artist && artist.name) {
          console.log(`Artist Name: ${artist.name}`);
        } else {
          console.log('Artist data is missing.');
        }
      });
    } else {
      console.log('Artist field is not an array.');
    }
  });

  res.status(200).render('overview_shoes', {
    customPaints,
    customShoesUrl: '/custom-painting-on-shoes',
  });
});

exports.getCustomPainting = catchAsync(async (req, res, next) => {
  const customPaint = await CustomPainting.findOne({ slug: req.params.slug })
    .populate({ path: 'artist', select: 'name photo' })
    .populate({ path: 'customReviews', select: 'customReview rating user' });

  if (!customPaint) {
    return next(new AppError('No custom painting found with that name', 404));
  }

  res.status(200).render('custom_painting', {
    customPaint,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.render('login', { title: 'Login to your account' });
});

exports.getSignUpForm = catchAsync(async (req, res) => {
  res.render('signup', { title: 'Sign up to your account' });
});

exports.getAccountDetails = catchAsync(async (req, res) => {
  res.render('account', { title: 'Your account' });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser,
  });
});

exports.getForgotPassword = catchAsync(async (req, res, next) => {
  res.status(200).render('forgotPassword', { title: 'Reset Your password' });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id });
    const paintIds = orders.map((order) => order.painting);
    const paintings = await Painting.find({ _id: { $in: paintIds } });
    res.status(200).render('overview', {
      title: 'My Paintings',
      paintings,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

exports.getResetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  console.log('Token in controller:', token);
  res.status(200).render('resetPassword', {
    title: 'Reset Your Password',
    token: token, // Pass the token to the view
  });
});

exports.getMyCustomOrders = catchAsync(async (req, res, next) => {
  try {
    const customOrders = await CustomOrder.find({ user: req.user.id });

    if (!customOrders || customOrders.length === 0) {
      console.log('No custom orders found for user:', req.user.id);
      return res.status(404).json({ message: 'No custom orders found' });
    }

    const customPaintIds = customOrders.map((order) => order.customPainting);
    const customPaints = await CustomPainting.find({
      _id: { $in: customPaintIds },
    });
    res.status(200).render('overview_shoes', {
      title: 'My Custom Paintings',
      customPaints,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});
