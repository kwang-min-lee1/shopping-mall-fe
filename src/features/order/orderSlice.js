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
    try {
      // ✅ 강의용: 백엔드 호출 안 함 (가짜 주문번호 생성)
      return fulfillWithValue(Date.now()); // orderNum만 리턴
    } catch (error) {
      return rejectWithValue("주문 생성 실패");
    }
  }
);

    // try{
    //   const response = await api.post("/order", payload);
    //   if(response.status!==200) throw Error(response.error)
    //     return response.data.orderNum;

    // }catch(error){
    //   dispatch(showToastMessage({message:error.error,status:"error"}));
    //   return rejectWithValue(error.error);
    // }
  


export const getOrder = createAsyncThunk(
  "order/getOrder",
  async (_, { rejectWithValue, dispatch }) => {}
);

export const getOrderList = createAsyncThunk(
  "order/getOrderList",
  async (query, { rejectWithValue, dispatch }) => {}
);

export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async ({ id, status }, { dispatch, rejectWithValue }) => {}
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
  },
});

export const { setSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
