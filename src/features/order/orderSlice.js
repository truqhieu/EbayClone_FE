// orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999/api';

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/buyers/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create order');
    }
  }
);

// Fetch order history
export const fetchOrderHistory = createAsyncThunk(
  'order/fetchOrderHistory',
  async ({ page = 1, limit = 10, status }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/buyers/orders?page=${page}&limit=${limit}`;
      
      if (status) {
        url += `&status=${status}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch order history');
    }
  }
);

// Fetch order details
export const fetchOrderDetails = createAsyncThunk(
  'order/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/buyers/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch order details');
    }
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    orders: [],
    currentOrder: null,
    orderDetails: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1
    },
    loading: false,
    error: null,
    createOrderSuccess: false
  },
  reducers: {
    resetOrderState: (state) => {
      state.createOrderSuccess = false;
      state.error = null;
    },
    clearOrderDetails: (state) => {
      state.orderDetails = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.createOrderSuccess = true;
        toast.success('Order created successfully!');
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Order history
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Order details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload.order;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const { resetOrderState, clearOrderDetails } = orderSlice.actions;

export default orderSlice.reducer;