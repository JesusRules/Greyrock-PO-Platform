// routes/vendorRouter.ts
import express from 'express';
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from '../controllers/vendorController';
import { protect } from '../middleware/auth';
import { adminOnly } from '../middleware/adminOnly';

const vendorRouter = express.Router();

// Protected admin-only routes
vendorRouter.get('/', protect, getVendors);
vendorRouter.post('/', protect, createVendor);
vendorRouter.put('/:id', protect, updateVendor);
vendorRouter.delete('/:id', protect, deleteVendor);

export default vendorRouter;
