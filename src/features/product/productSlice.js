import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import { showToastMessage } from "../common/uiSlice";
import { faLessThanEqual } from "@fortawesome/free-solid-svg-icons";

// 비동기 액션 생성
export const getProductList = createAsyncThunk(
  "products/getProductList",
  async (query, { rejectWithValue }) => {
    try{
      const response = await api.get("/product", {params:{...query}});
      console.log("rrr", response);
      
      return response.data;
    }catch(error){
      return rejectWithValue(error.error);
    }
  }
);

export const getProductDetail = createAsyncThunk(
  "products/getProductDetail",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/product/${id}`);
      
      // ✅ 백엔드가 product를 어떻게 보내는지에 따라 1줄만 선택
      // 1) res.json({ status:"success", product })
      return response.data.product;

      // 2) res.json({ status:"success", data: product })
      // return response.data.data;

      // 3) res.json(product)  (바로 product만 보내는 경우)
      // return response.data;
    } catch (error) {
      return rejectWithValue(error.error || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (formData, { dispatch, rejectWithValue }) => {
    try{
      const response = await api.post("/product", formData);
      
      dispatch(showToastMessage({message:"상품 생성 완료", status:"success"}));
      dispatch(getProductList({page:1}));
      return response.data.data;
    }catch(error){
      return rejectWithValue(error.error);
    };
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { dispatch, rejectWithValue }) => {}
);

export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, ...formData }, { dispatch, rejectWithValue }) => {
    try{
      const response = await api.put(`/product/${id}`,formData);  // 백틱(`):문자열 안에 변수(id)를 그대로 넣기 위해 쓰임
                                                                   // 예) const id = '123';
      dispatch(getProductList({page:1}));                         //     `/product/${id}`
                                                                  //    결과: "/product/123"
      return response.data.data;
    }catch(error){
      return rejectWithValue(error.error);
    }
  }
);

// 슬라이스 생성
const productSlice = createSlice({
  name: "products",
  initialState: {
    productList: [],
    selectedProduct: null,
    loading: false,
    error: "",
    totalPageNum: 1,
    success: false,
  },
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilteredList: (state, action) => {
      state.filteredList = action.payload;
    },
    clearError: (state) => {
      state.error = "";
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(createProduct.pending,(state, action)=>{
      state.loading = true;
    })
    .addCase(createProduct.fulfilled,(state, action)=>{
      state.loading = false;
      state.error = "";
      state.success = true;  // 상품 생성을 성공하면, 다이얼로그를 닫고
                             // 실패했다면, 실패 메세지를 다이얼로그에 보여주고 닫지는 않음

    })
    .addCase(createProduct.rejected,(state, action)=>{
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })
    .addCase(getProductList.pending,(state,action)=>{
      state.loading = true;
    })
    .addCase(getProductList.fulfilled,(state,action)=>{
      state.loading = false;
      state.productList = action.payload.data;
      state.error = "";  // 에러시 초기화
      state.totalPageNum = action.payload.totalPageNum;

    })
    .addCase(getProductList.rejected,(state,action)=>{
      state.loading = false;
      state.error = action.payload;
      
    })
    .addCase(editProduct.pending, (state,action)=>{
      state.loading = true;
    })
    .addCase(editProduct.fulfilled, (state,action)=>{
      state.loading = false;
      state.error = "";      // 에러값 초기화
      state.success = true;  // edit 성공 -> 팝업을 닫아줘야 함 -> 팝업 닫는데 이용했던 변수 success 활용
    })
    .addCase(editProduct.rejected, (state,action)=>{
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    })

     // 화면 안나옴 해결을 위해 강사와 다르게 추가 코드 작성함
    .addCase(getProductDetail.pending, (state) => {
      state.loading = true;
    })
    .addCase(getProductDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedProduct = action.payload;
      state.error = "";
    })
    .addCase(getProductDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });    
  },
});

export const { setSelectedProduct, setFilteredList, clearError } =
  productSlice.actions;
export default productSlice.reducer;
