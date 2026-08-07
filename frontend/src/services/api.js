import axios from 'axios';

// Configure Axios instance
const API = axios.create({
  baseURL: '/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
  * Request OTP for password reset
  * @param {string} email
  * @param {string} studentId
  */
export const requestForgotPasswordOTP = async (email, studentId) => {
  try {
    const response = await API.post('/forgot-password', {
      email,
      student_id: studentId,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to connect to PRMES backend server.' };
  }
};

/**
  * Verify 6-digit OTP code
  * @param {string} studentId
  * @param {string} email
  * @param {string} otp
  */
export const verifyOTP = async (studentId, email, otp) => {
  try {
    const response = await API.post('/verify-otp', {
      student_id: studentId,
      email,
      otp,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to verify OTP with backend server.' };
  }
};

/**
  * Reset password after successful OTP verification
  * @param {string} studentId
  * @param {string} email
  * @param {string} otp
  * @param {string} newPassword
  */
export const resetPassword = async (studentId, email, otp, newPassword) => {
  try {
    const response = await API.post('/reset-password', {
      student_id: studentId,
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to reset password.' };
  }
};

/**
  * Register new student
  */
export const registerStudent = async (formData) => {
  try {
    const response = await API.post('/register', formData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Registration failed.' };
  }
};

/**
  * Login student
  */
export const loginStudent = async (email, password) => {
  try {
    const response = await API.post('/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed.' };
  }
};
