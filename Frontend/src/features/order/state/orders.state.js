export const initialOrdersState = {
  orders: [],
  selectedOrder: null,
  selectedOrderItems: [],
  loadingOrders: false,
  loadingDetails: false,
  errorOrders: null,
  errorDetails: null,
};

export const OrdersActionTypes = {
  FETCH_ORDERS_START: "FETCH_ORDERS_START",
  FETCH_ORDERS_SUCCESS: "FETCH_ORDERS_SUCCESS",
  FETCH_ORDERS_ERROR: "FETCH_ORDERS_ERROR",
  FETCH_ORDER_DETAILS_START: "FETCH_ORDER_DETAILS_START",
  FETCH_ORDER_DETAILS_SUCCESS: "FETCH_ORDER_DETAILS_SUCCESS",
  FETCH_ORDER_DETAILS_ERROR: "FETCH_ORDER_DETAILS_ERROR",
  SELECT_ORDER: "SELECT_ORDER",
};

export const ordersReducer = (state, action) => {
  switch (action.type) {
    case OrdersActionTypes.FETCH_ORDERS_START:
      return {
        ...state,
        loadingOrders: true,
        errorOrders: null,
      };
    case OrdersActionTypes.FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        orders: action.payload.orders,
        loadingOrders: false,
        errorOrders: null,
      };
    case OrdersActionTypes.FETCH_ORDERS_ERROR:
      return {
        ...state,
        loadingOrders: false,
        errorOrders: action.payload,
      };
    case OrdersActionTypes.FETCH_ORDER_DETAILS_START:
      return {
        ...state,
        loadingDetails: true,
        errorDetails: null,
      };
    case OrdersActionTypes.FETCH_ORDER_DETAILS_SUCCESS:
      return {
        ...state,
        selectedOrder: action.payload.order,
        selectedOrderItems: action.payload.items,
        loadingDetails: false,
        errorDetails: null,
      };
    case OrdersActionTypes.FETCH_ORDER_DETAILS_ERROR:
      return {
        ...state,
        loadingDetails: false,
        errorDetails: action.payload,
      };
    case OrdersActionTypes.SELECT_ORDER:
      return {
        ...state,
        selectedOrder: action.payload.order,
        selectedOrderItems: [],
        errorDetails: null,
      };
    default:
      return state;
  }
};
