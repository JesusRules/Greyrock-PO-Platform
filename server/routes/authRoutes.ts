import express from 'express';
import { changePassword, createUser, deleteUser, getCurrentUser, loginUser, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { deleteUserSignature, updateUser, updateUserSignature } from '../controllers/userController.js';

const authRouter = express.Router();

// authRouter.post('/log-record', logUserLogin);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.put("/:id/change-password", protect, changePassword);

// In user routes too
authRouter.post('/:id/signature', protect, updateUserSignature); // Uses user route!
authRouter.delete("/:id/signature", protect, deleteUserSignature); // Uses user route!
authRouter.put("/:id", protect, updateUser) // Uses user route!

authRouter.get('/me', protect, getCurrentUser);
authRouter.post('/', protect, createUser);
// authRouter.put('/:id', protect, updateUser);
authRouter.delete('/:id', protect, deleteUser);

export default authRouter;
