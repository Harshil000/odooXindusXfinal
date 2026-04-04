import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../../auth/hook/useAuth";
import { getKitchenOrders, updateKitchenOrderStatus } from "../services/kitchen.api";
import { getSocket } from "../../../shared/services/socket";

const NEXT_STATUS = {
  to_cook: "preparing",
  preparing: "completed",
};

const EMPTY_COLUMNS = {
  to_cook: [],
  preparing: [],
  completed: [],
};

const useKitchen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingOrderId, setSavingOrderId] = useState(null);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getKitchenOrders();
      setOrders(data || []);
    } catch (requestError) {
      setError(requestError?.message || "Could not load kitchen orders");
    } finally {
      setLoading(false);
    }
  }, []);

  const moveOrderForward = useCallback(async (order) => {
    const nextStatus = NEXT_STATUS[order.status];
    if (!nextStatus) return;

    setSavingOrderId(order.id);
    setError("");
    try {
      const updated = await updateKitchenOrderStatus(order.id, nextStatus);
      setOrders((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (requestError) {
      setError(requestError?.message || "Could not update order status");
    } finally {
      setSavingOrderId(null);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!user?.restaurant_id) return;

    const socket = getSocket();
    socket.emit("join.restaurant", { restaurantId: user.restaurant_id });

    const onOrderCreated = (payload) => {
      setOrders((prev) => {
        if (prev.some((item) => item.id === payload.orderId)) return prev;
        return [
          {
            id: payload.orderId,
            table_id: payload.tableId,
            status: payload.status || "to_cook",
            created_at: payload.createdAt,
            item_count: payload.itemCount || 0,
          },
          ...prev,
        ];
      });
    };

    const onStatusChanged = (payload) => {
      setOrders((prev) => prev.map((item) => {
        if (item.id !== payload.orderId) return item;
        return { ...item, status: payload.newStatus };
      }));
    };

    socket.on("order.created", onOrderCreated);
    socket.on("order.status_changed", onStatusChanged);

    return () => {
      socket.off("order.created", onOrderCreated);
      socket.off("order.status_changed", onStatusChanged);
    };
  }, [user?.restaurant_id]);

  const columns = useMemo(() => {
    const grouped = { ...EMPTY_COLUMNS };
    for (const order of orders) {
      if (grouped[order.status]) {
        grouped[order.status].push(order);
      }
    }
    return grouped;
  }, [orders]);

  return {
    columns,
    loading,
    error,
    savingOrderId,
    moveOrderForward,
  };
};

export default useKitchen;
