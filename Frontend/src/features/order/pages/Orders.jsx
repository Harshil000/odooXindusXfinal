import "../styles/orders.scss";
import useOrders from "../hook/useOrders";

const Orders = () => {
  const {
    orders,
    selectedOrder,
    selectedOrderItems,
    loadingOrders,
    loadingDetails,
    errorOrders,
    errorDetails,
    selectOrder,
  } = useOrders();

  return (
    <main className="orders-page">
      <div className="page-header">
        <h1>Order History</h1>
      </div>

      <div className="orders-grid">
        <section className="orders-list-card">
          <div className="card-header">
            <h2>Orders</h2>
          </div>

          {loadingOrders ? (
            <div className="orders-empty">Loading orders...</div>
          ) : errorOrders ? (
            <div className="orders-empty orders-error">{errorOrders}</div>
          ) : (
            <div className="table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Table</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="orders-empty">
                        No orders yet. Create your first order!
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.displayDate}</td>
                        <td>{order.table_id || "-"}</td>
                        <td>{order.item_count || "-"}</td>
                        <td>
                          {order.total_amount
                            ? `₹${Number(order.total_amount).toFixed(2)}`
                            : "-"}
                        </td>
                        <td>{order.payment_method || "-"}</td>
                        <td>
                          <button
                            type="button"
                            className={`status-pill ${order.status || "draft"}`}
                            onClick={() => selectOrder(order)}
                          >
                            {order.status
                              ? order.status.toUpperCase()
                              : "DRAFT"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="order-details-card">
          <div className="card-header">
            <h2>Order Details</h2>
          </div>
          {selectedOrder ? (
            <div className="order-details-content">
              <div className="order-details-meta">
                <div>
                  <span>Order #</span>
                  <strong>{selectedOrder.id}</strong>
                </div>
                <div>
                  <span>Date</span>
                  <strong>{selectedOrder.displayDate}</strong>
                </div>
                <div>
                  <span>Table</span>
                  <strong>{selectedOrder.table_id || "-"}</strong>
                </div>
                <div>
                  <span>Session</span>
                  <strong>{selectedOrder.session_id || "-"}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedOrder.status || "Draft"}</strong>
                </div>
              </div>

              {loadingDetails ? (
                <div className="orders-empty">Loading details...</div>
              ) : errorDetails ? (
                <div className="orders-empty orders-error">{errorDetails}</div>
              ) : selectedOrderItems.length > 0 ? (
                <div className="order-items-section">
                  <div className="section-title">Items</div>
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product_id || "-"}</td>
                          <td>{item.quantity || 0}</td>
                          <td>₹{item.displayPrice}</td>
                          <td>₹{item.displaySubtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="orders-empty">
                  No line items found for this order.
                </div>
              )}
            </div>
          ) : (
            <div className="orders-empty">
              Click any order status to load the order details on the right.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Orders;
