import { useEffect, useMemo, useState } from "react";
import useTerminal from "../hook/useTerminal";
import PaymentModal from "../components/PaymentModal";
import MenuModal from "../components/MenuModal";
import "../styles/terminal.scss";

const Terminal = () => {
  const {
    activeSession,
    tables,
    products,
    cartByTable,
    unpaidOrdersByTable,
    loading,
    error,
    actionTableId,
    incrementProduct,
    decrementProduct,
    getCartItemsForTable,
    getCartTotalForTable,
    createOrderForTable,
    payByCashForTableOrder,
    payByNetbankingForTableOrder,
    getSelectedUnpaidOrderAmount,
    prefetchTaxIncludedAmountForTable,
  } = useTerminal();

  const [selectedTableId, setSelectedTableId] = useState("");
  const [paymentModalTableId, setPaymentModalTableId] = useState(null);
  const [menuTableId, setMenuTableId] = useState(null);
  const [customerByTable, setCustomerByTable] = useState({});

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

  const engageTable = (tableId) => {
    setSelectedTableId(String(tableId));
    setMenuTableId(tableId);
  };

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
            const unpaidTotal = getSelectedUnpaidOrderAmount(table.id);

            const placeOrderDisabled = !activeSession || busy || cartItems.length === 0;
            const paymentDisabled = busy || unpaidCount === 0;

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
                onClick={() => engageTable(table.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    engageTable(table.id);
                  }
                }}
              >
                <div className="table-card-head">
                  <h2>Table {table.table_number}</h2>
                  <span className={`status ${table.status}`}>{table.status}</span>
                </div>

                <p>Seats: {table.seats || 0}</p>
                <p>Unpaid Orders: {unpaidCount}</p>
                {customerByTable[String(table.id)] ? (
                  <p>
                    Customer: {customerByTable[String(table.id)]?.name}
                  </p>
                ) : (
                  <p className="table-select-note">Customer details will be asked at payment time.</p>
                )}

                {!isSelected ? (
                  <p className="table-select-note">Select this table to view cart and actions.</p>
                ) : (
                  <>
                <div className="cart-summary">
                  <span>{cartItems.length} item(s)</span>
                  <strong>INR {cartTotal.toFixed(2)}</strong>
                </div>

                <div className="cart-summary">
                  <span>Unpaid Bill</span>
                  <strong>INR {Number(unpaidTotal || 0).toFixed(2)}</strong>
                </div>

                {unpaidCount > 0 ? (
                  <p className="terminal-note">Payment will settle all unpaid orders for this table in one go.</p>
                ) : null}

                {disableReason && <p className="terminal-note">{disableReason}</p>}

                <div className="table-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busy || !activeSession}
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenuTableId(table.id);
                    }}
                  >
                    Open Menu
                  </button>

                  <button
                    type="button"
                    className="btn btn-subtle"
                    disabled={paymentDisabled}
                    onClick={(event) => {
                      event.stopPropagation();
                      prefetchTaxIncludedAmountForTable(table.id)
                        .catch(() => null)
                        .finally(() => setPaymentModalTableId(table.id));
                    }}
                  >
                    Payment
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
        initialCustomer={paymentModalTableId !== null ? customerByTable[String(paymentModalTableId)] : null}
        onClose={() => setPaymentModalTableId(null)}
        onPayByCash={(tableId, customer) => {
          setCustomerByTable((prev) => ({ ...prev, [String(tableId)]: customer }));
          return payByCashForTableOrder(tableId, customer);
        }}
        onPayByNetbanking={(tableId, customer) => {
          setCustomerByTable((prev) => ({ ...prev, [String(tableId)]: customer }));
          return payByNetbankingForTableOrder(tableId, customer);
        }}
      />

      <MenuModal
        isOpen={menuTableId !== null}
        table={tables.find((item) => String(item.id) === String(menuTableId)) || null}
        products={products}
        cartByTable={cartByTable}
        busy={actionTableId === menuTableId}
        activeSession={Boolean(activeSession)}
        onClose={() => setMenuTableId(null)}
        onIncrement={incrementProduct}
        onDecrement={decrementProduct}
        onPlaceOrder={async (tableId) => {
          await createOrderForTable(tableId);
          setMenuTableId(null);
        }}
        getCartItemsForTable={getCartItemsForTable}
        getCartTotalForTable={getCartTotalForTable}
      />
    </main>
  );
};

export default Terminal;
