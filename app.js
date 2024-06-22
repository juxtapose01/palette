const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const paintRouter = require('./routes/paintingRoutes');
const customPaintRouter = require('./routes/customPaintingRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const customReviewRouter = require('./routes/customReviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const orderRouter = require('./routes/orderRoutes');
const customOrderRouter = require('./routes/customOrderRoutes');
const app = express();

// Set view engine to Pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cookieParser());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      scriptSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:'],
      fontSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      connectSrc: ["'self'", 'ws://127.0.0.1:*'],
    },
  })
);
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; img-src 'self'; connect-src 'self' ws://127.0.0.1:64698;"
  );
  next();
});

app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "connect-src 'self' ws://127.0.0.1:53309"
  );
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'http://xxxx',
        'https://js.stripe.com/v3/',
        "'unsafe-inline'",
        "'unsafe-eval'",
      ],
      // Add other directives as needed
    },
  })
);

app.use(mongoSanitize());
app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message:
    'Too many requests from this IP address! Please try again in an hour',
});
app.use('/api', limiter);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '10kb' }));
app.use(
  hpp({
    whitelist: [
      'otherDetails',
      'dimensions',
      'brushTime',
      'difficulty',
      'ratingsAverage',
      'price',
      'priceDiscount',
      'shoeType',
      'shoeSize',
      'pricePerPair',
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/paintings', paintRouter);
app.use('/api/v1/custom-paintings', customPaintRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/custom-reviews', customReviewRouter);
app.use('/', viewRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/custom-orders', customOrderRouter);

app.get('/reset-email-sent', (req, res) => {
  res.render('notification', { userEmail: req.query.email });
});

app.get('/404-invalid-email-detected', (req, res) => {
  res.render('error_notification', { userEmail: req.query.email });
});

// Route to render the password reset form
app.get('/resetPassword/:token', (req, res, next) => {
  const { token } = req.params;
  res.render('resetPassword', { token });
});

app.post('/resetPassword/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
