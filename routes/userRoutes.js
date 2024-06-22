const express = require('express');
const router = express.Router();

const userController = require('./../Controllers/userController');
const authController = require('./../Controllers/authController');

router.route('/signUp').post(authController.signUp);
router.route('/login').post(authController.login);
router.get('/logout', authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router
  .route('/updateMyPassword')
  .patch(authController.protect, authController.updatePassword);
router
  .route('/updateMe')
  .patch(
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createNewUser);
router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    authController.getUser
  )
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
