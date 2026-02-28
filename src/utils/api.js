import axios from "axios";
// 상황따라 주소 다름
const LOCAL_BACKEND = process.env.REACT_APP_LOCAL_BACKEND;
// const PROD_BACKEND = process.env.REACT_APP_PROD_BACKEND;
// const BACKEND_PROXY = process.env.REACT_APP_BACKEND_PROXY;
// console.log("proxy", BACKEND_PROXY);

const BASE =
  process.env.REACT_APP_LOCAL_BACKEND ||
  process.env.REACT_APP_BACKEND_PROXY;

const token = sessionStorage.getItem("token");
 
  
const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: {
    "Content-Type": "application/json",
    // authorization: `Bearer ${sessionStorage.getItem("token")}`,   // 메인페이지에서 화면 안보이는 현상을 위해 강사의 코드를 주석처리 함
  },
});



// const api = axios.create({
//   baseURL: `${process.env.REACT_APP_BACKEND_PROXY}/api`,
//   //baseURL: LOCAL_BACKEND,
//   headers: {
//     "Content-Type": "application/json",
//     authorization: `Bearer ${sessionStorage.getItem("token")}`,
//   },
// });

/**
 * console.log all requests and responses
 */
api.interceptors.request.use(
  (request) => {
    console.log("Starting Request", request);

    const token = sessionStorage.getItem("token");
    if (token) request.headers.authorization = `Bearer ${token}`;
    else delete request.headers.authorization;

    // request.headers.authorization = `Bearer ${sessionStorage.getItem("token")}`; // 메인페이지에서 화면 안보이는 현상을 위해 강사의 코드를 주석처라 하고 위 세줄 코드 넣음

    return request;
  },
  function (error) {
    console.log("REQUEST ERROR", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    error = error.response.data;
    console.log("RESPONSE ERROR", error.response?.data || error);
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
