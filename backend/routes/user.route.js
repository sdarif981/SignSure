import express from 'express';
import { login, logout, register, forgotPassword, verifyOtp, resetPassword } from '../controller/user.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
const router=express.Router();

router.post('/register',register);
router.post('/login',login);
router.get('/logout',logout);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;