import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getTrackData } from "../services/track.api";
import { getSocket } from "../../../shared/services/socket";
import "../styles/trackOrder.scss";

const STATUS_LABEL = {
  to_cook: "Received",
  preparing: "Preparing",
  completed: "Ready",
  paid: "Paid",
};

const TrackOrder = () => {
  const { token } = useParams();
  const [table, setTable] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await getTrackData(token);
        setTable(response.table || null);
        setOrders(response.orders || []);

        const socket = getSocket();
        socket.emit("join.table", { tableId: response.table_id });
      } catch (requestError) {
        setError(requestError?.message || "Unable to load tracking details");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      load();
    }
  }, [token]);

  useEffect(() => {
    const socket = getSocket();

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

    const onOrderStatusChanged = (payload) => {
      setOrders((prev) => prev.map((order) => {
        if (order.id !== payload.orderId) return order;
        return { ...order, status: payload.newStatus };
      }));
    };

    socket.on("order.created", onOrderCreated);
    socket.on("order.status_changed", onOrderStatusChanged);

    return () => {
      socket.off("order.created", onOrderCreated);
      socket.off("order.status_changed", onOrderStatusChanged);
    };
  }, []);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [orders],
  );

  return (
    <main className="track-order-page">
      <section className="track-card">
        <h1>Live Order Status</h1>
        <p>Track your order in real time.</p>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="track-error">{error}</p>
        ) : (
          <>
            <div className="track-meta">
              <span>Table</span>
              <strong>{table?.table_number || "-"}</strong>
            </div>

            <ul className="track-list">
              {sortedOrders.length === 0 ? (
                <li className="track-empty">No active orders yet.</li>
              ) : (
                sortedOrders.map((order) => (
                  <li key={order.id} className="track-item">
                    <div>
                      <span className="track-order-id">Order #{String(order.id).slice(0, 8)}</span>
                      <small>{new Date(order.created_at).toLocaleTimeString("en-IN")}</small>
                    </div>
                    <span className={`track-status ${order.status}`}>{STATUS_LABEL[order.status] || order.status}</span>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </section>
    </main>
  );
};

export default TrackOrder;
