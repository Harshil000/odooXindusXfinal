import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [tableId, setTableId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTrackData = useCallback(async (showLoader = false) => {
    if (!token) return;

    if (showLoader) {
      setLoading(true);
    }

    setError("");
    try {
      const response = await getTrackData(token);
      setTable(response.table || null);
      setTableId(response.table_id || response.table?.id || null);
      setOrders(response.orders || []);
    } catch (requestError) {
      setError(requestError?.message || "Unable to load tracking details");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadTrackData(true);
    }
  }, [token, loadTrackData]);

  useEffect(() => {
    if (!tableId) return;

    const socket = getSocket();

    const joinTableRoom = () => {
      socket.emit("join.table", { tableId });
    };

    if (socket.connected) {
      joinTableRoom();
    }

    const onOrderCreated = () => loadTrackData(false);
    const onOrderStatusChanged = () => loadTrackData(false);

    socket.on("connect", joinTableRoom);
    socket.on("order.created", onOrderCreated);
    socket.on("order.status_changed", onOrderStatusChanged);

    return () => {
      socket.off("connect", joinTableRoom);
      socket.off("order.created", onOrderCreated);
      socket.off("order.status_changed", onOrderStatusChanged);
    };
  }, [tableId, loadTrackData]);

  useEffect(() => {
    if (!token) return undefined;

    const timer = window.setInterval(() => {
      loadTrackData(false);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [token, loadTrackData]);

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
                      <span className="track-order-id">
                        {Array.isArray(order.product_names) && order.product_names.length
                          ? order.product_names.join(", ")
                          : `${order.item_count || 0} item(s)`}
                      </span>
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
