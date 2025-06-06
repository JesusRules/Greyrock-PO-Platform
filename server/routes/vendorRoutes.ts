// routes/vendorRouter.ts
import express from 'express';
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorById,
} from '../controllers/vendorController.js';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const vendorRouter = express.Router();

vendorRouter.get('/', protect, getVendors);
vendorRouter.get('/:id', protect, getVendorById);

// Protected admin-only routes
vendorRouter.post('/', protect, createVendor);
vendorRouter.put('/:id', protect, updateVendor);
vendorRouter.delete('/:id', protect, deleteVendor);


export default vendorRouter;
