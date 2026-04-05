import { useEffect, useMemo, useState } from "react";
import useTerminal from "../hook/useTerminal";
import PaymentModal from "../components/PaymentModal";
import "../styles/terminal.scss";

const Terminal = () => {
  const {
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
    releaseTableSafely,
  } = useTerminal();

  const [selectedTableId, setSelectedTableId] = useState("");
  const [paymentModalTableId, setPaymentModalTableId] = useState(null);

  useEffect(() => {
    if (!tables.length) {
      setSelectedTableId("");
      return;
    }

    const exists = tables.some((item) => String(item.id) === String(selectedTableId));
    if (!exists) {
      setSelectedTableId(String(tables[0].id));
    }
  }, [tables, selectedTableId]);

  const selectedTable = useMemo(
    () => tables.find((item) => String(item.id) === String(selectedTableId)) || null,
    [selectedTableId, tables],
  );

  return (
    <main className="terminal-page">
      <div className="terminal-header">
        <div>
          <h1>Table Terminal</h1>
          <p>Select tables, create orders, and safely release tables after payment.</p>
        </div>
        <span className={`session-chip ${activeSession ? "active" : "inactive"}`}>
          {activeSession ? "Session Running" : "Session Closed"}
        </span>
      </div>

      {error && <p className="terminal-error">{error}</p>}

      {loading ? (
        <p className="terminal-empty">Loading tables...</p>
      ) : tables.length === 0 ? (
        <p className="terminal-empty">No tables found. Create tables from settings.</p>
      ) : (
        <>
          <p className="terminal-hint">Click a table card to select it and take actions.</p>
          <section className="table-grid">
          {tables.map((table) => {
            const unpaidCount = (unpaidOrdersByTable[table.id] || []).length;
            const busy = actionTableId === table.id;
            const isSelected = String(table.id) === String(selectedTableId);
            const cartItems = getCartItemsForTable(table.id);
            const cartTotal = getCartTotalForTable(table.id);
            const selectedOrderId =
              selectedUnpaidOrderByTable[table.id]
              || (unpaidOrdersByTable[table.id] || [])[0]?.id
              || "";

            const placeOrderDisabled = !activeSession || busy || cartItems.length === 0;
            const paymentDisabled = busy || unpaidCount === 0;
            const releaseDisabled = busy || table.status === "available";

            let disableReason = "";
            if (isSelected) {
              if (!activeSession) {
                disableReason = "Start a running session from home page to place orders.";
              } else if (products.length === 0) {
                disableReason = "Create active products first, then add items to cart.";
              } else if (cartItems.length === 0) {
                disableReason = "Add product quantity in cart to enable Place Order.";
              }
            }

            return (
              <article
                key={table.id}
                className={`table-card ${table.status} ${isSelected ? "selected" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTableId(String(table.id))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedTableId(String(table.id));
                  }
                }}
              >
                <div className="table-card-head">
                  <h2>Table {table.table_number}</h2>
                  <span className={`status ${table.status}`}>{table.status}</span>
                </div>

                <p>Seats: {table.seats || 0}</p>
                <p>Unpaid Orders: {unpaidCount}</p>

                {!isSelected ? (
                  <p className="table-select-note">Select this table to view cart and actions.</p>
                ) : (
                  <>
                <div className="products-section">
                  <h3>Cart Builder</h3>
                  <div className="product-list">
                    {products.length === 0 ? (
                      <p className="no-products">No active products available</p>
                    ) : products.map((product) => {
                      const qty = Number(cartByTable?.[table.id]?.[product.id] || 0);
                      return (
                        <div key={product.id} className="product-row">
                          <div>
                            <strong>{product.name}</strong>
                            <small>₹{Number(product.price || 0).toFixed(2)}</small>
                          </div>
                          <div className="qty-controls">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                decrementProduct(table.id, product.id);
                              }}
                              disabled={busy || qty === 0}
                            >
                              -
                            </button>
                            <span>{qty}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={(event) => {
                                event.stopPropagation();
                                incrementProduct(table.id, product.id);
                              }}
                              disabled={busy}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="cart-summary">
                    <span>{cartItems.length} item(s)</span>
                    <strong>₹{cartTotal.toFixed(2)}</strong>
                  </div>
                </div>

                <div className="pay-order-select-wrap">
                  <label htmlFor={`pay-order-${table.id}`}>Order To Settle</label>
                  <select
                    id={`pay-order-${table.id}`}
                    value={selectedOrderId}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => {
                      event.stopPropagation();
                      selectUnpaidOrderForTable(table.id, event.target.value);
                    }}
                    disabled={busy || unpaidCount === 0}
                  >
                    {unpaidCount === 0 ? (
                      <option value="">No unpaid orders</option>
                    ) : (
                      (unpaidOrdersByTable[table.id] || []).map((order) => (
                        <option key={order.id} value={order.id}>
                          {`#${String(order.id).slice(0, 8)} • ${order.status}`}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {disableReason && <p className="terminal-note">{disableReason}</p>}

                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={placeOrderDisabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      createOrderForTable(table.id);
                    }}
                  >
                    {busy ? "Working..." : "Place Order"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-subtle"
                    disabled={paymentDisabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      setPaymentModalTableId(table.id);
                    }}
                  >
                    Payment
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={releaseDisabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      releaseTableSafely(table.id);
                    }}
                  >
                    Release Table
                  </button>
                </div>
                  </>
                )}
              </article>
            );
          })}
          </section>
          {selectedTable && (
            <p className="terminal-selected">Selected Table: {selectedTable.table_number}</p>
          )}
        </>
      )}

      <PaymentModal
        isOpen={paymentModalTableId !== null}
        tableId={paymentModalTableId}
        amount={paymentModalTableId !== null ? getSelectedUnpaidOrderAmount(paymentModalTableId) : 0}
        busy={actionTableId === paymentModalTableId}
        onClose={() => setPaymentModalTableId(null)}
        onPayByCash={payByCashForTableOrder}
        onPayByNetbanking={payByNetbankingForTableOrder}
      />
    </main>
  );
};

export default Terminal;
