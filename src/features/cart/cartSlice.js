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
  
      dispatch(
        showToastMessage({
          message:"카트에 아이템이 추가 되었습니다.", 
          status:"success",
        })
      );
      return response.data.cartItemQty;  //TODO
    }catch(error) {
      const msg =
        error?.response?.data?.error ||     // { error: "..." }
        error?.response?.data?.message ||   // { message: "..." }
        error?.response?.data?.msg ||       // { msg: "..." } (가끔 이런 형태)
        error?.error ||                     // api.js가 가공해서 { error: "..." }로 넣는 경우
        error?.message ||                   // "Request failed with status code 400"
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
      
      return response.data.data;
    }catch(error){
      // return rejectWithValue(error.error);
      return rejectWithValue(error?.error || error?.message || error);
    }
  }
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (id, { rejectWithValue, dispatch }) => {
        try {
      const response = await api.delete(`/cart/${id}`);
  

      dispatch(
        showToastMessage({
          message: "카트에서 삭제되었습니다.",
          status: "success",
        })
      );

      // 백엔드가 { data: cart.items, cartItemQty: ... } 이런 형태로 주는 경우
      return {
        cartList: response.data.data || [],
        cartItemQty: response.data.cartItemQty ?? (response.data.data?.length || 0),
      };
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        "삭제 실패";

      dispatch(showToastMessage({ message: msg, status: "error" }));
      return rejectWithValue(msg);
    }
  }
);

export const updateQty = createAsyncThunk(
  "cart/updateQty",
  async ({ id, value }, { rejectWithValue, dispatch}) => {
    try {
      const qty = Number(value); // ✅ 문자열 방지
      const response = await api.put(`/cart/${id}`, { qty: value });
    

      // 수량 변경 후 카트 다시 불러오기 (강의 흐름 유지)
      dispatch(getCartList());

      return response.data;
    } catch (error) {
      dispatch(
        showToastMessage({
          message: "수량 변경 실패",
          status: "error",
        })
      );
      return rejectWithValue(
        error?.response?.data?.error || error?.message
      );
    }
  }
);

export const getCartQty = createAsyncThunk(
  "cart/getCartQty",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/cart/qty"); 
     
      return response.data.qty;
    } catch (error) {
      dispatch(showToastMessage({message:error, status:"error"}));
      return rejectWithValue(error);
    }
  }
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

        state.cartItemCount = (action.payload || []).length;

        state.totalPrice = action.payload.reduce(
          (total,item)=>total+item.productId.price*item.qty,
          0
        );
      })
      .addCase(getCartList.rejected,(state,action)=>{
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.error = "";

        // ✅ 화면에서 바로 없어지게 state 갱신
        state.cartList = action.payload.cartList || [];
        state.cartItemCount = action.payload.cartItemQty || 0;

       // ✅ totalPrice 다시 계산
        state.totalPrice = state.cartList.reduce(
        (total, item) => total + (item.productId?.price || 0) * (item.qty || 0),
        0
        );
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) 
      .addCase(getCartQty.fulfilled, (state, action) => {
        state.cartItemCount = action.payload || 0;
      })
      .addCase(updateQty.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQty.fulfilled, (state) => {
        state.loading = false;
        state.error = "";
      })
      .addCase(updateQty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }) 
    },
});

export default cartSlice.reducer;
export const { initialCart } = cartSlice.actions;
