import express from 'express';
import { createUser, deleteUser, getCurrentUser, loginUser, logoutUser, updateUser } from '../controllers/userController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const userRouter = express.Router();

// userRouter.post('/log-record', logUserLogin);
userRouter.post('/login', loginUser);
userRouter.post('/logout', logoutUser);

userRouter.get('/me', protect, adminOnly, getCurrentUser);
// userRouter.get('/', getAllUsersWithRoles);

userRouter.post('/', createUser);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);

export default userRouter;
