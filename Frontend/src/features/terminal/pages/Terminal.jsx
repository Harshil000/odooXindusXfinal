import { useEffect, useMemo, useState } from "react";
import useTerminal from "../hook/useTerminal";
import PaymentModal from "../components/PaymentModal";
import MenuModal from "../components/MenuModal";
import CustomerDetailsModal from "../components/CustomerDetailsModal";
import { toast } from "react-toastify";
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
    releaseTableSafely,
  } = useTerminal();

  const [selectedTableId, setSelectedTableId] = useState("");
  const [paymentModalTableId, setPaymentModalTableId] = useState(null);
  const [menuTableId, setMenuTableId] = useState(null);
  const [engageTableId, setEngageTableId] = useState(null);
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
    const key = String(tableId);
    const existing = customerByTable[key];
    setSelectedTableId(key);

    if (!existing?.name || !existing?.email) {
      setEngageTableId(tableId);
      return;
    }

    setMenuTableId(tableId);
  };

  const handleConfirmCustomer = ({ name, email }) => {
    if (!name || !email) {
      toast.error("Customer name and email are required");
      return;
    }

    const currentTableId = engageTableId;
    if (!currentTableId) return;

    setCustomerByTable((prev) => ({
      ...prev,
      [String(currentTableId)]: { name, email },
    }));
    setEngageTableId(null);
    setMenuTableId(currentTableId);
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

            const placeOrderDisabled = !activeSession || busy || cartItems.length === 0;
            const hasCustomerEmail = Boolean(customerByTable[String(table.id)]?.email);
            const paymentDisabled = busy || unpaidCount === 0 || !hasCustomerEmail;
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
                  <p className="table-select-note">Tap table to add customer details and open menu.</p>
                )}

                {!isSelected ? (
                  <p className="table-select-note">Select this table to view cart and actions.</p>
                ) : (
                  <>
                <div className="cart-summary">
                  <span>{cartItems.length} item(s)</span>
                  <strong>INR {cartTotal.toFixed(2)}</strong>
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
                      const existing = customerByTable[String(table.id)];
                      if (!existing?.name || !existing?.email) {
                        setEngageTableId(table.id);
                        return;
                      }
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
                      if (!hasCustomerEmail) {
                        setEngageTableId(table.id);
                        return;
                      }
                      prefetchTaxIncludedAmountForTable(table.id)
                        .catch(() => null)
                        .finally(() => setPaymentModalTableId(table.id));
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
                {!hasCustomerEmail && unpaidCount > 0 ? (
                  <p className="terminal-note">Add customer email to enable payment and auto receipt.</p>
                ) : null}
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
        onPayByCash={(tableId) => payByCashForTableOrder(tableId, customerByTable[String(tableId)]?.email)}
        onPayByNetbanking={(tableId) => payByNetbankingForTableOrder(tableId, customerByTable[String(tableId)]?.email)}
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

      <CustomerDetailsModal
        isOpen={engageTableId !== null}
        tableNumber={tables.find((item) => String(item.id) === String(engageTableId))?.table_number || ""}
        initialName={engageTableId ? customerByTable[String(engageTableId)]?.name : ""}
        initialEmail={engageTableId ? customerByTable[String(engageTableId)]?.email : ""}
        onClose={() => setEngageTableId(null)}
        onConfirm={handleConfirmCustomer}
      />
    </main>
  );
};

export default Terminal;
