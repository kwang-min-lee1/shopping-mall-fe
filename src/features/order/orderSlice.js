import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getCartQty } from "../cart/cartSlice";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

// Define initial state
const initialState = {
  orderList: [],
  orderNum: "",
  selectedOrder: {},
  error: "",
  loading: false,
  totalPageNum: 1,
};

// Async thunks
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (payload, { fulfillWithValue, rejectWithValue, dispatch }) => {
    try{
      const response = await api.post("/order", payload);
      if(response.status!==200) throw new Error(response.error);
        dispatch(getCartQty());
        return response.data.orderNum;

    }catch(error){
      dispatch(showToastMessage({message:error.error,status:"error"}));
      return rejectWithValue(error.error);
    }
  }
);

    

export const getOrder = createAsyncThunk(
  "order/getOrder",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/order"); // 내 주문
      // 백엔드가 { status, data, totalPageNum } 형태로 주는 경우가 많음
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getOrderList = createAsyncThunk(
  "order/getOrderList",
  async (query, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get(`/order/list?${query}`); // 관리자 주문리스트 (강사 라우트에 맞춰 조정)
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ id, status }, { dispatch, rejectWithValue }) => {
     try {
      const response = await api.put(`/order/${id}`, { status });
      dispatch(showToastMessage({ message: "주문 상태가 업데이트되었습니다.", status: "success" }));
      return response.data;
    } catch (error) {
      dispatch(showToastMessage({ message: error?.error || "업데이트 실패", status: "error" }));
      return rejectWithValue(error);
    }
  }
);

// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createOrder.pending,(state, action)=>{
      state.loading = true;
    })
    .addCase(createOrder.fulfilled,(state, action)=>{
      state.loading = false;
      state.error = "";
      state.orderNum = action.payload;
    })
    .addCase(createOrder.rejected,(state, action)=>{
      state.loading = false;
      state.error = action.payload;
    })
    // ✅ 내 주문 조회
    .addCase(getOrder.pending, (state) => {
      state.loading = true;
    })
    .addCase(getOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.error = "";
      const payload = action.payload;

      // ✅ response.data가 {status, data, totalPageNum} 인 경우
      // ✅ 응답 형태가 달라도 최대한 흡수
      state.orderList =
        payload?.data ||
        payload?.orderList ||
        payload?.orders ||
        [];

      state.totalPageNum = payload?.totalPageNum || payload?.totalPage || 1;
    })
    .addCase(getOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // ✅ (관리자) 주문 리스트
    .addCase(getOrderList.pending, (state) => {
      state.loading = true;
    })
    .addCase(getOrderList.fulfilled, (state, action) => {
      state.loading = false;
      state.error = "";
      state.orderList = action.payload?.data || [];
      state.totalPageNum = action.payload?.totalPageNum || 1;
    })
    .addCase(getOrderList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // ✅ 주문 상태 변경
    .addCase(updateOrder.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateOrder.fulfilled, (state) => {
      state.loading = false;
      state.error = "";
    })
    .addCase(updateOrder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export const { setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
