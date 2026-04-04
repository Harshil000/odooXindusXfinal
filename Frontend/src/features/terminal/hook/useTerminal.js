import { useCallback, useEffect, useMemo, useState } from "react";
import { getActiveSession } from "../../session/services/Session.api";
import { getTables, releaseTable } from "../../setting/services/table.api";
import { createOrder, getOrderDetails, getOrders } from "../../order/services/orders.api";
import { getProducts } from "../../product/services/product.api";
import { createOrderItem } from "../../order/services/orderItems.api";
import { createCashPayment } from "../../payment/services/payment.api";

const useTerminal = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cartByTable, setCartByTable] = useState({});
  const [selectedUnpaidOrderByTable, setSelectedUnpaidOrderByTable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionTableId, setActionTableId] = useState(null);

  const loadTerminalData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sessionData, tablesData, ordersData, productsData] = await Promise.all([
        getActiveSession(),
        getTables(),
        getOrders(),
        getProducts(),
      ]);

      setActiveSession(sessionData || null);
      setTables(Array.isArray(tablesData) ? tablesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (requestError) {
      setError(requestError?.message || "Could not load terminal data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTerminalData();
  }, [loadTerminalData]);

  const unpaidOrdersByTable = useMemo(() => {
    return orders.reduce((acc, order) => {
      if (order.status === "paid") return acc;
      if (!order.table_id) return acc;
      if (!acc[order.table_id]) {
        acc[order.table_id] = [];
      }
      acc[order.table_id].push(order);
      return acc;
    }, {});
  }, [orders]);

  const setProductQuantity = useCallback((tableId, productId, quantity) => {
    setCartByTable((prev) => {
      const tableCart = { ...(prev[tableId] || {}) };
      const safeQty = Number(quantity);

      if (!safeQty || safeQty < 0) {
        delete tableCart[productId];
      } else {
        tableCart[productId] = safeQty;
      }

      if (Object.keys(tableCart).length === 0) {
        const next = { ...prev };
        delete next[tableId];
        return next;
      }

      return {
        ...prev,
        [tableId]: tableCart,
      };
    });
  }, []);

  const incrementProduct = useCallback((tableId, productId) => {
    const current = Number(cartByTable?.[tableId]?.[productId] || 0);
    setProductQuantity(tableId, productId, current + 1);
  }, [cartByTable, setProductQuantity]);

  const decrementProduct = useCallback((tableId, productId) => {
    const current = Number(cartByTable?.[tableId]?.[productId] || 0);
    setProductQuantity(tableId, productId, Math.max(0, current - 1));
  }, [cartByTable, setProductQuantity]);

  const getCartItemsForTable = useCallback((tableId) => {
    const tableCart = cartByTable?.[tableId] || {};
    return products
      .map((product) => {
        const quantity = Number(tableCart[product.id] || 0);
        const price = Number(product.price || 0);
        return {
          product,
          quantity,
          price,
          subtotal: quantity * price,
        };
      })
      .filter((item) => item.quantity > 0);
  }, [cartByTable, products]);

  const getCartTotalForTable = useCallback((tableId) => {
    return getCartItemsForTable(tableId).reduce((sum, item) => sum + item.subtotal, 0);
  }, [getCartItemsForTable]);

  const createOrderForTable = useCallback(async (tableId) => {
    if (!activeSession?.id) {
      setError("Open a POS session before creating orders");
      return;
    }

    const cartItems = getCartItemsForTable(tableId);
    if (cartItems.length === 0) {
      setError("Add at least one product before placing the order");
      return;
    }

    setActionTableId(tableId);
    setError("");
    try {
      const created = await createOrder({
        table_id: tableId,
        session_id: activeSession.id,
      });

      await Promise.all(
        cartItems.map((item) => createOrderItem({
          order_id: created.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.price,
        })),
      );

      setOrders((prev) => [created, ...prev]);
      setTables((prev) => prev.map((table) => {
        if (table.id !== tableId) return table;
        return { ...table, status: "occupied" };
      }));
      setSelectedUnpaidOrderByTable((prev) => ({
        ...prev,
        [tableId]: created.id,
      }));
      setCartByTable((prev) => {
        const next = { ...prev };
        delete next[tableId];
        return next;
      });
    } catch (requestError) {
      setError(requestError?.message || "Could not create order for table");
    } finally {
      setActionTableId(null);
    }
  }, [activeSession?.id, getCartItemsForTable]);

  const selectUnpaidOrderForTable = useCallback((tableId, orderId) => {
    setSelectedUnpaidOrderByTable((prev) => ({
      ...prev,
      [tableId]: orderId,
    }));
  }, []);

  const settleCashForTableOrder = useCallback(async (tableId) => {
    const list = unpaidOrdersByTable[tableId] || [];
    if (!list.length) {
      setError("No unpaid orders for this table");
      return;
    }

    const selectedOrderId = selectedUnpaidOrderByTable[tableId];
    const latest = [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
    const selected = list.find((item) => item.id === selectedOrderId) || latest;

    setActionTableId(tableId);
    setError("");
    try {
      const detail = await getOrderDetails(selected.id);
      const amount = (detail?.items || []).reduce(
        (sum, item) => sum + Number(item.subtotal || 0),
        0,
      );

      if (amount <= 0) {
        throw new Error("Selected order has no payable amount");
      }

      await createCashPayment({
        amount,
        order_id: selected.id,
      });

      setOrders((prev) => prev.map((item) => (
        item.id === selected.id ? { ...item, status: "paid" } : item
      )));

      const remainingUnpaid = list.filter((item) => item.id !== selected.id).length;
      if (remainingUnpaid === 0) {
        setTables((prev) => prev.map((table) => {
          if (table.id !== tableId) return table;
          return { ...table, status: "available" };
        }));
      }

      setSelectedUnpaidOrderByTable((prev) => {
        const next = { ...prev };
        if (remainingUnpaid === 0) {
          delete next[tableId];
        }
        return next;
      });
    } catch (requestError) {
      setError(requestError?.message || "Could not settle cash payment");
    } finally {
      setActionTableId(null);
    }
  }, [selectedUnpaidOrderByTable, unpaidOrdersByTable]);

  const releaseTableSafely = useCallback(async (tableId) => {
    setActionTableId(tableId);
    setError("");
    try {
      const released = await releaseTable(tableId);
      setTables((prev) => prev.map((table) => (table.id === tableId ? released : table)));
    } catch (requestError) {
      setError(requestError?.message || "Could not release table");
    } finally {
      setActionTableId(null);
    }
  }, []);

  return {
    activeSession,
    tables,
    products,
    cartByTable,
    unpaidOrdersByTable,
    selectedUnpaidOrderByTable,
    loading,
    error,
    actionTableId,
    incrementProduct,
    decrementProduct,
    getCartItemsForTable,
    getCartTotalForTable,
    createOrderForTable,
    selectUnpaidOrderForTable,
    settleCashForTableOrder,
    releaseTableSafely,
    refresh: loadTerminalData,
  };
};

export default useTerminal;
