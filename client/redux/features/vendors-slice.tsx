// src/redux/slices/vendorSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Vendor } from '../../../types/Vendor';
import api from '../../axiosSetup';

interface VendorState {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  initLoad: boolean;
  selectedLoad: boolean;
  error: string | null;
}

const initialState: VendorState = {
  vendors: [],
  selectedVendor: null,
  initLoad: false,
  selectedLoad: false,
  error: null,
};

// Slice
const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
    //Fetch SINGLE Vendor
    .addCase(fetchVendorById.pending, (state) => {
        state.selectedLoad = true;
        state.error = null;
      })
      .addCase(fetchVendorById.fulfilled, (state, action: PayloadAction<Vendor>) => {
        state.selectedVendor = action.payload;
        state.selectedLoad = false;
      })
      .addCase(fetchVendorById.rejected, (state, action) => {
        state.selectedLoad = false;
        state.error = action.error.message || 'Failed to fetch vendor';
      })
      // Fetch ALL Vendors
      .addCase(fetchVendors.pending, (state) => {
        state.initLoad = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action: PayloadAction<Vendor[]>) => {
        state.vendors = action.payload;
        state.initLoad = false;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.initLoad = false;
        state.error = action.error.message || 'Failed to fetch vendors';
      })

      // Add
      .addCase(addVendor.fulfilled, (state, action: PayloadAction<Vendor>) => {
        state.vendors.push(action.payload);
      })

      // Update
      .addCase(updateVendor.fulfilled, (state, action: PayloadAction<Vendor>) => {
        const index = state.vendors.findIndex((v) => v._id === action.payload._id);
        if (index !== -1) state.vendors[index] = action.payload;
      })

      // Delete
      .addCase(deleteVendor.fulfilled, (state, action: PayloadAction<string>) => {
        state.vendors = state.vendors.filter((v) => v._id !== action.payload);
      });
  },
});

// Async Thunks
export const fetchVendorById = createAsyncThunk<Vendor, string>(
  'vendors/fetchVendorById',
  async (id) => {
    const res = await api.get(`/api/vendors/${id}`);
    console.log(res.data.vendor);
    return res.data.vendor;
  }
);

export const fetchVendors = createAsyncThunk<Vendor[]>('vendors/fetchVendors', async () => {
  const res = await api.get('/api/vendors');
  console.log('res.data.vendors', res.data.vendors);
  return res.data.vendors;
});

export const addVendor = createAsyncThunk<Vendor, Vendor>(
  'vendors/addVendor',
  async (vendorData) => {
    const res = await api.post('/api/vendors', vendorData);
    return res.data.vendor;
  }
);

export const updateVendor = createAsyncThunk<Vendor, { id: string; updatedData: Vendor }>(
  'vendors/updateVendor',
  async ({ id, updatedData }) => {
    const res = await api.put(`/api/vendors/${id}`, updatedData);
    return res.data.vendor;
  }
);

export const deleteVendor = createAsyncThunk<string, string>(
  'vendors/deleteVendor',
  async (id) => {
    await api.delete(`/api/vendors/${id}`);
    return id;
  }
);

export default vendorSlice.reducer;
