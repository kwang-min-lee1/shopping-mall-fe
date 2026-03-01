import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import CartProductCard from "./component/CartProductCard";
import OrderReceipt from "../PaymentPage/component/OrderReceipt";
import "./style/cart.style.css";
import { getCartList } from "../../features/cart/cartSlice";
import { applyCoupon, removeCoupon } from "../../features/cart/cartSlice";

const CartPage = () => {
  const dispatch = useDispatch();
  const { cartList, totalPrice, discountAmount, finalPrice, coupon, error } = useSelector((state) => state.cart);
  const [couponCode, setCouponCode] = useState("");
  const onApplyCoupon = () => {
    dispatch(applyCoupon(couponCode));
  };

const onRemoveCoupon = () => {
  dispatch(removeCoupon());
  setCouponCode("");
};



  useEffect(() => {
    //카트리스트 불러오기
    dispatch(getCartList());
  }, []);

  return (
    <Container>
      <Row>
        <Col xs={12} md={7}>
          {cartList.length > 0 ? (
            cartList.map((item) => (
              <CartProductCard item={item} key={item._id} />
            ))
          ) : (
            <div className="text-align-center empty-bag">
              <h2>카트가 비어있습니다.</h2>
              <div>상품을 담아주세요!</div>
            </div>
          )}
        </Col>
        <Col xs={12} md={5}>
          <OrderReceipt 
            cartList = {cartList} 
            totalPrice={totalPrice}
            discountAmount={discountAmount}
            finalPrice={finalPrice}
            coupon={coupon}
          />
          
          <div className="coupon-box mt-3">
            <h5>쿠폰</h5>

            {!coupon ? (
              <>
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="예: SAVE10 / SAVE5000 / FREESHIP"
                  className="form-control"
                />
                <Button className="mt-2 w-100" variant="dark" onClick={onApplyCoupon}>
                  쿠폰 적용
                </Button>
                {error && <div className="text-danger mt-2">{error}</div>}
              </>
            ) : (
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  적용쿠폰: <b>{coupon.code}</b>
                </div>
                <Button variant="outline-secondary" size="sm" onClick={onRemoveCoupon}>
                  해제
                </Button>
              </div>
            )}
          </div>

          <hr />

          <div className="price-summary">
            <div className="d-flex justify-content-between">
              <span>상품합계</span>
              <span>{(totalPrice || 0).toLocaleString()}원</span>
            </div>

            <div className="d-flex justify-content-between">
              <span>할인</span>
              <span>- {(discountAmount || 0).toLocaleString()}원</span>
            </div>

            <div className="d-flex justify-content-between mt-2">
              <b>최종결제금액</b>
              <b>{(finalPrice || totalPrice || 0).toLocaleString()}원</b>
            </div>
          </div>
          
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
