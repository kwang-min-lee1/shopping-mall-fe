import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";

const initialState = {
  loading: false,
  error: "",
  cartList: [],
  selectedItem: {},
  cartItemCount: 0,
  totalPrice: 0,
};

// Async thunk actions
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, size }, { rejectWithValue, dispatch }) => {
    try{
      const response = await api.post("/cart", {productId,size,qty:1});
      if(response.status !==200) throw new Error(response.error);
      dispatch(
        showToastMessage({
          message:"카트에 아이템이 추가 되었습니다.", 
          status:"success",
        })
      );
      return response.data.cartItemQty;  //TODO
    }catch(error) {
      const msg =
        error?.response?.data?.error || // ✅ 백엔드: { error: "아이템이 이미..." }
        error?.message ||
        "카트에 아이템 추가 실패";

      dispatch(
        showToastMessage({
          message:msg, 
          status:"error",
        })
      );
      return rejectWithValue(msg);
    }
  }
);

export const getCartList = createAsyncThunk(
  "cart/getCartList",
  async (_, { rejectWithValue }) => {  // 강사가 제시한 코드인  dispatch 제거 (카드 페이지에 아무것도 안나오는 오류생김)
    try{
      const response = await api.get("/cart");
      if(response.status!==200) throw new Error(response.error);
      return response.data.data;
    }catch(error){
      // return rejectWithValue(error.error);
      return rejectWithValue(error?.error || error?.message || error);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, { rejectWithValue, dispatch }) => {}
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ id, value }, { rejectWithValue }) => {}
);

export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, { rejectWithValue, dispatch }) => {}
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    initialCart: (state) => {
      state.cartItemCount = 0;
    },
    // You can still add reducers here for non-async actions if necessary
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending,(state, action)=>{
        state.loading = true;
      })
      .addCase(addToCart.fulfilled,(state, action)=>{
        state.loading = false;
        state.error = "";
        state.cartItemCount = action.payload;
        
      })
      .addCase(addToCart.rejected,(state, action)=>{
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCartList.pending,(state,action)=>{
        state.loading = true;
      })
      .addCase(getCartList.fulfilled,(state,action)=>{
        state.loading = false;
        state.error = "";
        // state.cartList = action.payload;
        state.cartList = action.payload || [];
        state.totalPrice = action.payload.reduce(
          (total,item)=>total+item.productId.price*item.qty,
          0
        );
      })
      .addCase(getCartList.rejected,(state,action)=>{
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
