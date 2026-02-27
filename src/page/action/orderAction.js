const getOrder = ()=> async(dispatch)=>{
    try{
        dispatch({type:type.GET_ORDER_REQUSET});
        const response = await api.get("/order/me");

        if(response.status !==200) throw new Error(response.error);

        dispatch({type:Types.GET_ORDER_SUCCESS, payload:response.data});
    }catch(error){
        dispatch({type:types.GET_ORDER_FAIL, error:error});
        dispatch(commonUiActions.showToastMessage(error, "error"));
    }
};