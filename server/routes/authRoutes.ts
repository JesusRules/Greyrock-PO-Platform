import express from 'express';
import { createUser, deleteUser, getCurrentUser, loginUser, logoutUser, updateUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const authRouter = express.Router();

// authRouter.post('/log-record', logUserLogin);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);

authRouter.get('/me', protect, getCurrentUser);
/// authRouter.get('/me', protect, adminOnly, getCurrentUser);

authRouter.post('/', protect, createUser);
authRouter.put('/:id', protect, updateUser);
authRouter.delete('/:id', protect, deleteUser);

export default authRouter;
