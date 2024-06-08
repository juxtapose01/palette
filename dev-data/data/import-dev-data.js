const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Painting = require('./../../models/paintingModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModal');
const customReview = require('./../../models/customReviewModal');
const customPaintng = require('./../../models/customPaintingModel');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected successfully');
  })
  .catch((err) => {
    console.error('DB connection error:', err);
  });

const paintings = JSON.parse(
  fs.readFileSync(`${__dirname}/paintings.json`, 'UTF-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'UTF-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'UTF-8')
);
const customreviews = JSON.parse(
  fs.readFileSync(`${__dirname}/customReviews.json`, 'UTF-8')
);
const customPaintngs = JSON.parse(
  fs.readFileSync(`${__dirname}/customPaintings.json`, 'UTF-8')
);

//IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Painting.create(paintings);
    // await User.create(users);
    await Review.create(reviews);
    await customReview.create(customreviews);
    await customPaintng.create(customPaintngs);
    console.log('Data loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//Delete all data from collection
const deleteData = async () => {
  try {
    await Painting.deleteMany();
    // await User.deleteMany();
    await Review.deleteMany();
    await customReview.deleteMany();
    await customPaintng.deleteMany();
    console.log('Data deleted');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
