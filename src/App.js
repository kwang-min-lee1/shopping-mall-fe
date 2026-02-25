import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import "./common/style/common.style.css";
import AppLayout from "./Layout/AppLayout";
import AppRouter from "./routes/AppRouter";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCartList } from "./features/cart/cartSlice"; // ✅ 또는 getCartQty


function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      dispatch(getCartList()); // ✅ 로그인 상태면 카트도 같이 불러오기
      // dispatch(getCartQty()); // (원하면 이걸로 "개수만" 불러와도 됨)
    }
  }, [dispatch]);


  return (
    <div>
      <AppLayout>
        <AppRouter />
      </AppLayout>
    </div>
  );
}

export default App;
