import express from 'express';
import { login, logout, register } from '../controller/user.controller.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
const router=express.Router();

router.post('/register',register);
router.post('/login',login);
router.get('/logout',logout);

export default router;