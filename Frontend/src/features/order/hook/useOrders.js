import { useEffect, useReducer, useCallback } from "react";
import { getOrders, getOrderDetails } from "../services/orders.api";
import {
  initialOrdersState,
  ordersReducer,
  OrdersActionTypes,
} from "../state/orders.state";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
};

const normalizeOrder = (order) => ({
  ...order,
  displayDate: formatDate(order.created_at || order.updated_at || order.date),
});

const normalizeItems = (items) =>
  items.map((item) => ({
    ...item,
    displayPrice: Number(item.price || 0).toFixed(2),
    displaySubtotal: Number(item.subtotal || 0).toFixed(2),
  }));

const useOrders = () => {
  const [state, dispatch] = useReducer(ordersReducer, initialOrdersState);

  const loadOrders = useCallback(async () => {
    dispatch({ type: OrdersActionTypes.FETCH_ORDERS_START });

    try {
      const response = await getOrders();
      const orders = (response || []).map(normalizeOrder);
      dispatch({
        type: OrdersActionTypes.FETCH_ORDERS_SUCCESS,
        payload: { orders },
      });
    } catch (error) {
      dispatch({
        type: OrdersActionTypes.FETCH_ORDERS_ERROR,
        payload: error?.error || error?.message || String(error),
      });
    }
  }, []);

  const loadOrderDetails = useCallback(async (order) => {
    dispatch({ type: OrdersActionTypes.SELECT_ORDER, payload: { order } });

    try {
      dispatch({ type: OrdersActionTypes.FETCH_ORDER_DETAILS_START });
      const response = await getOrderDetails(order.id);
      const items = normalizeItems(response.items || []);
      dispatch({
        type: OrdersActionTypes.FETCH_ORDER_DETAILS_SUCCESS,
        payload: { order: normalizeOrder(response.order), items },
      });
    } catch (error) {
      dispatch({
        type: OrdersActionTypes.FETCH_ORDER_DETAILS_ERROR,
        payload: error?.error || error?.message || String(error),
      });
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    ...state,
    loadOrders,
    selectOrder: loadOrderDetails,
  };
};

export default useOrders;
