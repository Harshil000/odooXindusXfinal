import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getActiveSession } from "../../session/services/Session.api";
import { getTables, releaseTable } from "../../setting/services/table.api";
import {
  createOrder,
  getOrderDetails,
  getOrders,
  sendCombinedOrderReceipt,
  updateOrderStatus,
} from "../../order/services/orders.api";
import { getProducts } from "../../product/services/product.api";
import { createOrderItem } from "../../order/services/orderItems.api";
import {
  createCashPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../payment/services/payment.api";
import { toast } from "react-toastify";

const getErrorMessage = (requestError, fallback) => (
  requestError?.message
  || requestError?.error
  || fallback
);

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const calculatePayableAmountFromItems = (items = []) => {
  return items.reduce((sum, item) => {
    const subtotal = Number(item?.subtotal || 0);
    const taxPercent = Number(item?.tax_percent || 0);
    const safeTaxPercent = Number.isFinite(taxPercent) && taxPercent > 0 ? taxPercent : 0;
    const lineTax = (subtotal * safeTaxPercent) / 100;
    return sum + subtotal + lineTax;
  }, 0);
};

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
  const [payableAmountByOrder, setPayableAmountByOrder] = useState({});
  const createOrderInFlight = useRef(new Set());
  const paymentInFlight = useRef(new Set());

  const loadRazorpayScript = useCallback(() => new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  }), []);

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
      const message = getErrorMessage(requestError, "Could not load terminal data");
      setError(message);
      toast.error(message);
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

  const getSelectedUnpaidOrderAmount = useCallback((tableId) => {
    const list = unpaidOrdersByTable[tableId] || [];
    if (!list.length) return 0;

    let total = 0;
    for (const order of list) {
      const cached = Number(payableAmountByOrder[order.id]);
      if (Number.isFinite(cached) && cached > 0) {
        total += cached;
      } else {
        total += Number(order?.total_amount || 0);
      }
    }

    return total;
  }, [unpaidOrdersByTable, payableAmountByOrder]);

  const prefetchTaxIncludedAmountForTable = useCallback(async (tableId) => {
    const list = unpaidOrdersByTable[tableId] || [];
    if (!list.length) return 0;

    const amountPairs = await Promise.all(
      list.map(async (order) => {
        const cached = Number(payableAmountByOrder[order.id]);
        if (Number.isFinite(cached) && cached > 0) {
          return [order.id, cached];
        }

        const detail = await getOrderDetails(order.id);
        const amountWithTax = calculatePayableAmountFromItems(detail?.items || []);
        return [order.id, amountWithTax];
      }),
    );

    const amountMap = Object.fromEntries(amountPairs);
    setPayableAmountByOrder((prev) => ({
      ...prev,
      ...amountMap,
    }));

    return Object.values(amountMap).reduce((sum, value) => sum + Number(value || 0), 0);
  }, [unpaidOrdersByTable, payableAmountByOrder]);

  const createOrderForTable = useCallback(async (tableId) => {
    if (createOrderInFlight.current.has(tableId)) return;

    if (!activeSession?.id) {
      const message = "Open a POS session before creating orders";
      setError(message);
      toast.error(message);
      return;
    }

    const cartItems = getCartItemsForTable(tableId);
    if (cartItems.length === 0) {
      const message = "Add at least one product before placing the order";
      setError(message);
      toast.error(message);
      return;
    }

    setActionTableId(tableId);
    createOrderInFlight.current.add(tableId);
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

      const localTotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
      const localItemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const enrichedCreated = {
        ...created,
        total_amount: localTotal,
        item_count: localItemCount,
      };

      setOrders((prev) => [enrichedCreated, ...prev]);
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
      const message = getErrorMessage(requestError, "Could not create order for table");
      setError(message);
      toast.error(message);
    } finally {
      createOrderInFlight.current.delete(tableId);
      setActionTableId(null);
    }
  }, [activeSession?.id, getCartItemsForTable]);

  const selectUnpaidOrderForTable = useCallback((tableId, orderId) => {
    setSelectedUnpaidOrderByTable((prev) => ({
      ...prev,
      [tableId]: orderId,
    }));
  }, []);

  const payByCashForTableOrder = useCallback(async (tableId, receiptEmail) => {
    if (paymentInFlight.current.has(tableId)) return;

    paymentInFlight.current.add(tableId);
    setActionTableId(tableId);
    setError("");
    try {
      const list = unpaidOrdersByTable[tableId] || [];
      if (!list.length) {
        throw new Error("No unpaid orders for this table");
      }

      const amountPairs = await Promise.all(
        list.map(async (order) => {
          const detail = await getOrderDetails(order.id);
          return [order.id, calculatePayableAmountFromItems(detail?.items || [])];
        }),
      );
      const amountMap = Object.fromEntries(amountPairs);
      const amount = Object.values(amountMap).reduce((sum, value) => sum + Number(value || 0), 0);
      const orderIds = list.map((order) => order.id);

      if (amount <= 0) {
        throw new Error("Selected order has no payable amount");
      }

      console.log("[payByCashForTableOrder] Creating cash payment:", { amount, tableId, orderCount: orderIds.length });
      await createCashPayment({
        amount,
        order_id: null,
      });

      await Promise.all(orderIds.map((orderId) => updateOrderStatus(orderId, "paid")));

      setPayableAmountByOrder((prev) => ({
        ...prev,
        ...amountMap,
      }));

      if (isValidEmail(receiptEmail)) {
        try {
          await sendCombinedOrderReceipt({
            orderIds,
            userEmail: String(receiptEmail).trim(),
          });
          toast.success("All orders paid and combined receipt sent");
        } catch (mailError) {
          console.warn("Receipt email failed:", mailError);
          toast.warning("All orders paid, but combined receipt email failed");
        }
      } else {
        toast.success("All table orders paid successfully");
      }

      setOrders((prev) => prev.map((item) => (
        orderIds.includes(item.id) ? { ...item, status: "paid" } : item
      )));

      try {
        const released = await releaseTable(tableId);
        setTables((prev) => prev.map((table) => (table.id === tableId ? released : table)));
      } catch {
        setTables((prev) => prev.map((table) => {
          if (table.id !== tableId) return table;
          return { ...table, status: "available" };
        }));
      }

      setSelectedUnpaidOrderByTable((prev) => {
        const next = { ...prev };
        delete next[tableId];
        return next;
      });
    } catch (requestError) {
      console.error("[payByCashForTableOrder] Error:", requestError);
      const message = getErrorMessage(requestError, "Could not complete cash payment");
      setError(message);
      toast.error(message);
    } finally {
      paymentInFlight.current.delete(tableId);
      setActionTableId(null);
    }
  }, [unpaidOrdersByTable]);

  const payByNetbankingForTableOrder = useCallback(async (tableId, receiptEmail) => {
    if (paymentInFlight.current.has(tableId)) return;

    paymentInFlight.current.add(tableId);
    setActionTableId(tableId);
    setError("");
    try {
      console.log("[payByNetbankingForTableOrder] Starting netbanking payment");
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady || !window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      const list = unpaidOrdersByTable[tableId] || [];
      if (!list.length) {
        throw new Error("No unpaid orders for this table");
      }

      const amountPairs = await Promise.all(
        list.map(async (order) => {
          const detail = await getOrderDetails(order.id);
          return [order.id, calculatePayableAmountFromItems(detail?.items || [])];
        }),
      );
      const amountMap = Object.fromEntries(amountPairs);
      const amount = Object.values(amountMap).reduce((sum, value) => sum + Number(value || 0), 0);
      const orderIds = list.map((order) => order.id);
      const primaryOrderId = orderIds[0] || null;

      if (amount <= 0) {
        throw new Error("Selected order has no payable amount");
      }

      console.log("[payByNetbankingForTableOrder] Creating razorpay order:", { amount, tableId, orderCount: orderIds.length });
      const orderPayload = await createRazorpayOrder({
        amount,
        order_id: primaryOrderId,
      });

      setPayableAmountByOrder((prev) => ({
        ...prev,
        ...amountMap,
      }));

      console.log("[payByNetbankingForTableOrder] Razorpay order payload:", orderPayload);
      const razorpayOrder = orderPayload?.razorpayOrder;
      const razorpayKeyId = orderPayload?.razorpayKeyId;

      if (!razorpayOrder?.id || !razorpayKeyId) {
        throw new Error("Could not initialize netbanking payment");
      }

      await new Promise((resolve, reject) => {
        const instance = new window.Razorpay({
          key: razorpayKeyId,
          amount: Number(razorpayOrder.amount || 0),
          currency: razorpayOrder.currency || "INR",
          name: "POS Payment",
          description: `Table #${tableId} - ${orderIds.length} order(s)`,
          order_id: razorpayOrder.id,
          method: {
            netbanking: true,
            upi: true,
            card: false,
            wallet: false,
            emi: false,
            paylater: false,
          },
          handler: async (response) => {
            try {
              console.log("[payByNetbankingForTableOrder] Payment handler called with response:", response);
              await verifyRazorpayPayment({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
              console.log("[payByNetbankingForTableOrder] Payment verified successfully");
              resolve();
            } catch (verifyError) {
              console.error("[payByNetbankingForTableOrder] Verification error:", verifyError);
              reject(verifyError);
            }
          },
          modal: {
            ondismiss: () => {
              console.log("[payByNetbankingForTableOrder] Payment modal dismissed");
              reject(new Error("Payment cancelled"));
            },
          },
          theme: { color: "#0f766e" },
        });

        instance.open();
      });

      await Promise.all(orderIds.map((orderId) => updateOrderStatus(orderId, "paid")));

      if (isValidEmail(receiptEmail)) {
        try {
          await sendCombinedOrderReceipt({
            orderIds,
            userEmail: String(receiptEmail).trim(),
          });
          toast.success("All orders paid and combined receipt sent");
        } catch (mailError) {
          console.warn("Receipt email failed:", mailError);
          toast.warning("All orders paid, but combined receipt email failed");
        }
      } else {
        toast.success("All table orders paid successfully");
      }

      setOrders((prev) => prev.map((item) => (
        orderIds.includes(item.id) ? { ...item, status: "paid" } : item
      )));

      try {
        const released = await releaseTable(tableId);
        setTables((prev) => prev.map((table) => (table.id === tableId ? released : table)));
      } catch {
        setTables((prev) => prev.map((table) => {
          if (table.id !== tableId) return table;
          return { ...table, status: "available" };
        }));
      }

      setSelectedUnpaidOrderByTable((prev) => {
        const next = { ...prev };
        delete next[tableId];
        return next;
      });
    } catch (requestError) {
      console.error("[payByNetbankingForTableOrder] Error:", requestError);
      const message = getErrorMessage(requestError, "Could not complete netbanking payment");
      setError(message);
      toast.error(message);
    } finally {
      paymentInFlight.current.delete(tableId);
      setActionTableId(null);
    }
  }, [loadRazorpayScript, unpaidOrdersByTable]);

  const releaseTableSafely = useCallback(async (tableId) => {
    setActionTableId(tableId);
    setError("");
    try {
      const released = await releaseTable(tableId);
      setTables((prev) => prev.map((table) => (table.id === tableId ? released : table)));
      toast.success("Table released successfully");
    } catch (requestError) {
      const message = Number(requestError?.unpaid_orders) > 0
        ? `Payment needed: ${requestError.unpaid_orders} unpaid order(s) still open`
        : getErrorMessage(requestError, "Could not release table");
      setError(message);
      toast.error(message);
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
    payByCashForTableOrder,
    payByNetbankingForTableOrder,
    getSelectedUnpaidOrderAmount,
    prefetchTaxIncludedAmountForTable,
    releaseTableSafely,
    refresh: loadTerminalData,
  };
};

export default useTerminal;
