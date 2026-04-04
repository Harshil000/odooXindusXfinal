import useKitchen from "../hook/useKitchen";
import "../styles/kitchen.scss";

const STATUS_TITLES = {
  to_cook: "To Cook",
  preparing: "Preparing",
  completed: "Completed",
};

const NEXT_LABEL = {
  to_cook: "Start Preparing",
  preparing: "Mark Completed",
};

const formatTime = (dateValue) => {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Kitchen = () => {
  const { columns, loading, error, savingOrderId, moveOrderForward } = useKitchen();

  return (
    <main className="kitchen-page">
      <div className="kitchen-header">
        <div>
          <h1>Kitchen Display</h1>
          <p>Live queue synced with POS order events.</p>
        </div>
      </div>

      {error && <div className="kitchen-error">{error}</div>}

      <section className="kitchen-board">
        {Object.keys(STATUS_TITLES).map((status) => (
          <article className="kitchen-column" key={status}>
            <header className="kitchen-column-header">
              <h2>{STATUS_TITLES[status]}</h2>
              <span>{columns[status].length}</span>
            </header>

            <div className="kitchen-column-body">
              {loading ? (
                <p className="kitchen-empty">Loading orders...</p>
              ) : columns[status].length === 0 ? (
                <p className="kitchen-empty">No orders in this stage.</p>
              ) : (
                columns[status].map((order) => (
                  <div className="kitchen-ticket" key={order.id}>
                    <div className="ticket-row">
                      <span className="ticket-label">Order</span>
                      <strong>#{String(order.id).slice(0, 8)}</strong>
                    </div>
                    <div className="ticket-row">
                      <span className="ticket-label">Table</span>
                      <strong>{order.table_id || "-"}</strong>
                    </div>
                    <div className="ticket-row">
                      <span className="ticket-label">Items</span>
                      <strong>{order.item_count || 0}</strong>
                    </div>
                    <div className="ticket-row">
                      <span className="ticket-label">Time</span>
                      <strong>{formatTime(order.created_at)}</strong>
                    </div>

                    {NEXT_LABEL[order.status] && (
                      <button
                        type="button"
                        className="kitchen-action"
                        disabled={savingOrderId === order.id}
                        onClick={() => moveOrderForward(order)}
                      >
                        {savingOrderId === order.id ? "Updating..." : NEXT_LABEL[order.status]}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default Kitchen;
