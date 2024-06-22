import '@babel/polyfill';
import { login, logout, signUp, forgotPassword, resetPassword } from './login';

import { updateSettings } from './updateSettings';
import { orderPainting, orderCustomPainting } from './stripe';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('.form--login');
  const signUpForm = document.querySelector('.form--signup');
  const logOutBtn = document.querySelector('.nav__el--logout');
  const userDataForm = document.querySelector('.form-user-data');
  const userPasswordForm = document.querySelector('.form-user-password');
  const orderBtn = document.getElementById('order-painting');
  const customOrderBtn = document.getElementById('order-custom-painting');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  // const resetPasswordForm = document.getElementById('.form--resetpassword');

  const resetPasswordForm = document.querySelector('.form--password-reset');

  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const token = window.location.pathname.split('/').pop();
      const url = `/api/v1/users/resetPassword/${token}`;

      console.log('Reset Password URL:', url);

      try {
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password, confirmPassword }),
        });

        if (!response.ok) {
          throw new Error('Failed to reset password');
        }

        const data = await response.json();
        alert('Password reset successful');
        console.log(data);
      } catch (error) {
        console.error('Error:', error);
        alert('Password reset failed');
      }
    });
  }

  const sendPasswordResetEmail = async (user, resetURL) => {
    const message = `
      Hi ${user.firstName},
      Forgot your password? Click the link below to reset your password:
      ${resetURL}
      If you didn't forget your password, please ignore this email.
    `;
    try {
      await sendEmail({
        email: user.email,
        subject: 'Your password reset token (valid for only 10 minutes)',
        message,
      });
      console.log('Reset token sent to email!');
    } catch (err) {
      console.log('There was an error sending the email. Try again later!');
    }
  };

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await login(email, password);
    });
  }

  // if (forgotPasswordForm) {
  //   console.log('ahhahaha');
  //   forgotPasswordForm.addEventListener('submit', async (e) => {
  //     e.preventDefault();
  //     const email = document.getElementById('email').value;
  //     await forgotPassword(email);
  //   });
  // }

  if (signUpForm) {
    signUpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      await signUp(name, email, password, confirmPassword);
    });
  }

  if (logOutBtn) {
    logOutBtn.addEventListener('click', logout);
  }

  if (userDataForm) {
    userDataForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData();
      form.append('name', document.getElementById('name').value);
      form.append('email', document.getElementById('email').value);
      form.append('photo', document.getElementById('photo').files[0]);
      updateSettings(form, 'data');
    });
  }

  if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...';
      const currentPassword = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('password-confirm').value;
      await updateSettings(
        { currentPassword, password, confirmPassword },
        'password'
      );
      document.querySelector('.btn--save-password').textContent =
        'Save password';
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  }

  if (orderBtn) {
    orderBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.target.textContent = 'Processing...';
      const paintingId = e.target.dataset.paintingId;
      try {
        await orderPainting(paintingId);
      } catch (err) {
        console.error('Order Painting Error:', err);
      }
      e.target.textContent = 'Order Painting';
    });
  }

  if (customOrderBtn) {
    customOrderBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.target.textContent = 'Processing...';
      const customPaintId = e.target.dataset.customPaintingId;
      try {
        await orderCustomPainting(customPaintId);
      } catch (err) {
        console.error('Order Custom Painting Error:', err);
      }
      e.target.textContent = 'Order Custom Painting';
    });
  }
});

console.log('Script loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');

  const forgotPasswordForm = document.getElementById('forgotPasswordForm');

  if (forgotPasswordForm) {
    console.log('Forgot Password Form Found');
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Forgot Password Form Submitted');
      const email = document.getElementById('email').value;
      console.log('Email:', email);
      await forgotPassword(email);
    });
  } else {
    console.log('Forgot Password Form Not Found');
  }
});
