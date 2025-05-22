// controllers/vendorController.ts
import { Request, Response } from 'express';
import Vendor from '../models/Vendor.js';
import { createNoCacheHeaders } from '../utils/noCacheResponse.js';

export const getVendorById = async (_req: Request, res: Response) => {
  try {
    const { id } = _req.params;
    const vendor = await Vendor.findById(id);

    if (!vendor) {
      res
        .set(createNoCacheHeaders())
        .status(404)
        .json({ message: 'Vendor not found' });
        return;
    }

    res
    .set(createNoCacheHeaders())
    .status(200).json({ vendor });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: 'Failed to fetch vendor' });
  }
};

export const getVendors = async (_req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res
    .set(createNoCacheHeaders())
    .status(200).json({ vendors });
  } catch (error) {
    res
    .set(createNoCacheHeaders())
    .status(500).json({ message: 'Failed to fetch vendors' });
  }
};

export const createVendor = async (req: Request, res: Response) => {
  try {
    const newVendor = await Vendor.create(req.body);
    res
    .set(createNoCacheHeaders())
    .status(201).json({ vendor: newVendor });
  } catch (error) {
    res
    .set(createNoCacheHeaders())
    .status(400).json({ message: 'Failed to create vendor' });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const vendor = await Vendor.findByIdAndUpdate(id, body, { new: true });
    if (!vendor) { 
        res
        .set(createNoCacheHeaders())
        .status(404).json({ message: 'Vendor not found' });
        return;
    };
    res
    .set(createNoCacheHeaders())
    .status(200).json({ vendor });
  } catch (error) {
    res
    .set(createNoCacheHeaders())
    .status(400).json({ message: 'Failed to update vendor' });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
        res
        .set(createNoCacheHeaders())
        .status(404).json({ message: 'Vendor not found' }) 
        return;
    };
    res
    .set(createNoCacheHeaders())
    .status(200).json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    res.status(400)
    .set(createNoCacheHeaders())
    .json({ message: 'Failed to delete vendor' });
  }
};
