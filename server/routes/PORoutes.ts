import express from 'express';
import { createUser, deleteUser, getCurrentUser, loginUser, logoutUser, updateUser } from '../controllers/userController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const PORouter = express.Router();

PORouter.post('/login', loginUser);
PORouter.post('/logout', logoutUser);

PORouter.get('/me', protect, adminOnly, getCurrentUser);

PORouter.post('/', createUser);
PORouter.put('/:id', updateUser);
PORouter.delete('/:id', deleteUser);

export default PORouter;
