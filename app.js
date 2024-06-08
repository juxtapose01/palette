const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize'); // Corrected import
const xss = require('xss-clean'); // Corrected import
const hpp = require('hpp');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controllers/errorController');
const paintRouter = require('./routes/paintingRoutes');
const customPaintRouter = require('./routes/customPaintingRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const customReviewRouter = require('./routes/customReviewRoutes');

const app = express();

// 1. MIDDLEWARES
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // Corrected time window to 1 hour
  message:
    'Too many requests from this IP address! Please try again in an hour',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize()); // Corrected usage
app.use(xss()); // Corrected usage
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
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/paintings', paintRouter);
app.use('/api/v1/custom-paintings', customPaintRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/custom-reviews', customReviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
