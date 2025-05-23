import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { PurchaseOrder } from "../../../types/PurchaseOrder";
import api from "../../axiosSetup";

interface State {
  purchaseOrders: PurchaseOrder[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  purchaseOrders: [],
  loading: false,
  error: null,
};

const purchaseOrdersSlice = createSlice({
  name: "purchaseOrders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchaseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchaseOrders.fulfilled, (state, action: PayloadAction<PurchaseOrder[]>) => {
        state.loading = false;
        state.purchaseOrders = action.payload;
      })
      .addCase(fetchPurchaseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createPurchaseOrder.fulfilled, (state, action: PayloadAction<PurchaseOrder>) => {
        state.purchaseOrders.push(action.payload);
      })

      .addCase(updatePurchaseOrder.fulfilled, (state, action: PayloadAction<PurchaseOrder>) => {
        const index = state.purchaseOrders.findIndex(po => po._id === action.payload._id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      })

      .addCase(deletePurchaseOrder.fulfilled, (state, action: PayloadAction<string>) => {
        state.purchaseOrders = state.purchaseOrders.filter(po => po._id !== action.payload);
      })

      .addCase(togglePurchaseOrderStatus.fulfilled, (state, action: PayloadAction<PurchaseOrder>) => {
        const index = state.purchaseOrders.findIndex(po => po._id === action.payload._id);
        if (index !== -1) {
          state.purchaseOrders[index] = action.payload;
        }
      })
      // signPurchaseOrder
      .addCase(signPurchaseOrder.fulfilled, (state, action) => {
      const updatedPO = action.payload;
      const index = state.purchaseOrders.findIndex(po => po._id === updatedPO._id);
      if (index !== -1) {
        state.purchaseOrders[index] = updatedPO;
      }
    })
    // revert signature
    .addCase(revertSignature.fulfilled, (state, action) => {
      const updatedPO = action.payload;
      const index = state.purchaseOrders.findIndex(po => po._id === updatedPO._id);
      if (index !== -1) {
        state.purchaseOrders[index].signedImg = null;
        state.purchaseOrders[index] = updatedPO;
      }
    })
  },
});


// Async thunks
export const fetchPurchaseOrders = createAsyncThunk(
  "purchaseOrders/fetchAll",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/api/purchase-orders");
      return res.data.purchaseOrders;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

export const createPurchaseOrder = createAsyncThunk(
  "purchaseOrders/create",
  async (newOrder: Partial<PurchaseOrder>, thunkAPI) => {
    try {
      const res = await api.post("/api/purchase-orders", newOrder);
      return res.data.purchaseOrder;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to create");
    }
  }
);

export const updatePurchaseOrder = createAsyncThunk(
  "purchaseOrders/update",
  async ({ _id, updatedData }: { _id: string; updatedData: Partial<PurchaseOrder> }, thunkAPI) => {
    try {
      const res = await api.put(`/api/purchase-orders/${_id}`, updatedData);
      return res.data.purchaseOrder;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

export const deletePurchaseOrder = createAsyncThunk(
  "purchaseOrders/delete",
  async (_id: string, thunkAPI) => {
    try {
      await api.delete(`/api/purchase-orders/${_id}`);
      return _id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  }
);

export const togglePurchaseOrderStatus = createAsyncThunk(
  "purchaseOrders/toggleStatus",
  async (_id: string, thunkAPI) => {
    try {
      const res = await api.patch(`/api/purchase-orders/${_id}/toggle-status`);
      return res.data.purchaseOrder;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to toggle status");
    }
  }
);

export const signPurchaseOrder = createAsyncThunk<
  PurchaseOrder,
  { id: string; signature: string, signedBy: string },
  { rejectValue: string }
>("purchaseOrders/sign", async ({ id, signature, signedBy }, thunkAPI) => {
  try {
    const res = await api.put(`/api/purchase-orders/${id}/sign`, { signature, signedBy });
    return res.data.purchaseOrder;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to sign purchase order");
  }
});

export const revertSignature = createAsyncThunk<
  PurchaseOrder,
  string,
  { rejectValue: string }
>("purchaseOrders/revertSignature", async (_id, thunkAPI) => {
  try {
    const res = await api.put(`/api/purchase-orders/${_id}/revert-signature`);
    return res.data.purchaseOrder;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to revert signature");
  }
});

export default purchaseOrdersSlice.reducer;
