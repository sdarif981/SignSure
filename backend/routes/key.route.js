import express from 'express';

import isAuthenticated from '../middleware/isAuthenticated.js';
import { getPublicKey } from '../controller/key.controller.js';
const router=express.Router();

router.get('/public_key',isAuthenticated,getPublicKey);

export default router;