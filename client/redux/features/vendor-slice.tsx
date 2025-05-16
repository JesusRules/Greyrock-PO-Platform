// src/redux/slices/vendorSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { Vendor } from '../../../types/Vendor';

interface VendorState {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  vendors: [],
  loading: false,
  error: null,
};

// Slice
const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action: PayloadAction<Vendor[]>) => {
        state.vendors = action.payload;
        state.loading = false;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
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
export const fetchVendors = createAsyncThunk<Vendor[]>('vendors/fetchVendors', async () => {
  const res = await axios.get('/api/vendors');
  return res.data.vendors;
});

export const addVendor = createAsyncThunk<Vendor, Vendor>(
  'vendors/addVendor',
  async (vendorData) => {
    const res = await axios.post('/api/vendors', vendorData);
    return res.data.vendor;
  }
);

export const updateVendor = createAsyncThunk<Vendor, { id: string; updatedData: Vendor }>(
  'vendors/updateVendor',
  async ({ id, updatedData }) => {
    const res = await axios.put(`/api/vendors/${id}`, updatedData);
    return res.data.vendor;
  }
);

export const deleteVendor = createAsyncThunk<string, string>(
  'vendors/deleteVendor',
  async (id) => {
    await axios.delete(`/api/vendors/${id}`);
    return id;
  }
);

export default vendorSlice.reducer;
