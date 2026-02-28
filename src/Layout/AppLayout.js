import React, { useEffect } from "react";
import { useLocation } from "react-router";
import { Col, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../common/component/Sidebar";
import Navbar from "../common/component/Navbar";
import ToastMessage from "../common/component/ToastMessage";
import { loginWithToken } from "../features/user/userSlice";
import { getCartQty } from "../features/cart/cartSlice";
import { getCartList } from "../features/cart/cartSlice";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.user);
  
 /*
 AppLayout은 항상 뜬다.
 그런데 loginWithToken은 token이 없는데도 호출된다.
 그러면 api.get("/user/me") 요청이 나가는데,
 토큰이 없으면 백엔드에서 Token not found / invalid token 같은 응답이 오고
 api.js interceptor가 "RESPONSE ERROR"를 콘솔에 찍는다.
 
 즉, 지금 RESPONSE ERROR의 1순위 원인은 loginWithToken을 “무조건 호출”하기 때문.
 (구글 로그인 성공/실패와 별개로, 앱 첫 로딩 시점에 한 번은 터질 수 있음)
 따라서 useEffcet 의 강사의 코드를 주석처리 하고, 새로 작성함
 */


  useEffect(() => {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  if (token) dispatch(loginWithToken());
  }, [dispatch]);
  
  // useEffect(() => {
  //   dispatch(loginWithToken());
  // }, []);

  useEffect(() => {
    if (user) {
      dispatch(getCartQty());
      dispatch(getCartList());
    }
  }, [user, dispatch]);

  return (
    <div>
      <ToastMessage />
      {location.pathname.includes("admin") ? (
        <Row className="vh-100">
          <Col xs={12} md={3} className="sidebar mobile-sidebar">
            <Sidebar />
          </Col>
          <Col xs={12} md={9}>
            {children}
          </Col>
        </Row>
      ) : (
        <>
          <Navbar user={user} />
          {children}
        </>
      )}
    </div>
  );
};

export default AppLayout;
