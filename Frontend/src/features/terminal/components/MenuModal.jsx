import { useMemo } from "react";

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

  const groupedProducts = useMemo(() => {
    const sortedProducts = [...products].sort((a, b) => {
      const categoryA = String(a?.category_name || "Uncategorized").toLowerCase();
      const categoryB = String(b?.category_name || "Uncategorized").toLowerCase();
      if (categoryA !== categoryB) return categoryA.localeCompare(categoryB);
      return String(a?.name || "").toLowerCase().localeCompare(String(b?.name || "").toLowerCase());
    });

    return sortedProducts.reduce((acc, product) => {
      const category = product?.category_name || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  }, [products]);

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div className="terminal-modal-card terminal-menu-modal" onClick={(event) => event.stopPropagation()}>
        <div className="terminal-modal-header">
          <h2>Table {table.table_number} Menu</h2>
          <button type="button" className="terminal-close-btn" onClick={onClose}>
            x
          </button>
        </div>

        <p className="terminal-menu-subtitle">Browse by category and add items quickly with quantity controls.</p>

        {!activeSession ? (
          <p className="terminal-note">Start a running session from home page to place orders.</p>
        ) : null}

        <div className="terminal-product-wrap terminal-product-list">
          {products.length === 0 ? (
            <p className="no-products">No active products available</p>
          ) : Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
            <section key={categoryName} className="menu-category-section">
              <header className="menu-category-header">
                <h3>{categoryName}</h3>
                <span>{categoryProducts.length} items</span>
              </header>
              <div className="menu-category-grid">
                {categoryProducts.map((product) => {
                  const qty = Number(cartByTable?.[tableId]?.[product.id] || 0);
                  return (
                    <div key={product.id} className="product-row menu-product-row">
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
            </section>
          ))}
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
