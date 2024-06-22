import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: { email, password },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', 'Login failed. Please check your credentials.');
    }
  } catch (err) {
    showAlert('error', 'Error logging in. Please try again later.');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', 'Error logging out! Please try again.');
    }
  } catch (err) {
    console.error('Logout error:', err);
    showAlert('error', 'Error logging out! Please try again.');
  }
};

export const signUp = async (name, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signUp',
      data: { name, email, password, confirmPassword },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Signup successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', 'Signup failed. Enter valid details');
    }
  } catch (err) {
    showAlert('error', 'Error signing up. Please try again later.');
  }
};

export const forgotPassword = async (email) => {
  console.log('Forgot Password Function Called');
  try {
    const res = await axios.post('/api/v1/users/forgotPassword', { email });
    console.log('Server Response:', res.data);

    if (res.data.status === 'success') {
      // Redirect to the success page
      window.location.href = '/reset-email-sent';
    } else {
      // Redirect to the error page
      window.location.href = '/404-invalid-email-detected';
    }
  } catch (err) {
    console.error('Forgot Password Error:', err);
    // Redirect to the error page
    window.location.href = '/404-invalid-email-detected';
  }
};

export const resetPassword = async (token, password, passwordConfirm) => {
  try {
    const response = await fetch(`/api/v1/users/resetPassword/${token}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password, passwordConfirm }),
    });

    if (!response.ok) {
      throw new Error('Failed to reset password');
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
