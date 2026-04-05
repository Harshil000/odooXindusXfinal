const MenuModal = ({
  isOpen,
  table,
  products,
  cartByTable,
  busy,
  activeSession,
  onClose,
  onIncrement,
  onDecrement,
  onPlaceOrder,
  getCartItemsForTable,
  getCartTotalForTable,
}) => {
  if (!isOpen || !table) return null;

  const tableId = table.id;
  const cartItems = getCartItemsForTable(tableId);
  const cartTotal = getCartTotalForTable(tableId);
  const placeOrderDisabled = !activeSession || busy || cartItems.length === 0;

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div className="terminal-modal-card terminal-menu-modal" onClick={(event) => event.stopPropagation()}>
        <div className="terminal-modal-header">
          <h2>Menu for Table {table.table_number}</h2>
          <button type="button" className="terminal-close-btn" onClick={onClose}>
            x
          </button>
        </div>

        {!activeSession ? (
          <p className="terminal-note">Start a running session from home page to place orders.</p>
        ) : null}

        <div className="product-list terminal-product-list">
          {products.length === 0 ? (
            <p className="no-products">No active products available</p>
          ) : products.map((product) => {
            const qty = Number(cartByTable?.[tableId]?.[product.id] || 0);
            return (
              <div key={product.id} className="product-row">
                <div>
                  <strong>{product.name}</strong>
                  <small>INR {Number(product.price || 0).toFixed(2)}</small>
                </div>
                <div className="qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => onDecrement(tableId, product.id)}
                    disabled={busy || qty === 0}
                  >
                    -
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => onIncrement(tableId, product.id)}
                    disabled={busy}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-summary terminal-cart-summary">
          <span>{cartItems.length} item(s)</span>
          <strong>INR {cartTotal.toFixed(2)}</strong>
        </div>

        <div className="terminal-modal-actions">
          <button type="button" className="btn btn-subtle" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={placeOrderDisabled}
            onClick={() => onPlaceOrder(tableId)}
          >
            {busy ? "Working..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuModal;
