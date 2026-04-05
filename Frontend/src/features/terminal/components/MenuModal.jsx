import { useEffect, useMemo, useState } from "react";

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
  const [selectedCategory, setSelectedCategory] = useState("All");

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const categoryA = String(a?.category_name || "Uncategorized").toLowerCase();
      const categoryB = String(b?.category_name || "Uncategorized").toLowerCase();
      if (categoryA !== categoryB) return categoryA.localeCompare(categoryB);
      return String(a?.name || "").toLowerCase().localeCompare(String(b?.name || "").toLowerCase());
    });
  }, [products]);

  const categories = useMemo(() => {
    const unique = new Set(sortedProducts.map((product) => product?.category_name || "Uncategorized"));
    return ["All", ...Array.from(unique)];
  }, [sortedProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "All") return sortedProducts;
    return sortedProducts.filter((product) => (product?.category_name || "Uncategorized") === selectedCategory);
  }, [selectedCategory, sortedProducts]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategory("All");
  }, [isOpen, tableId]);

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

        <div className="menu-category-row" role="tablist" aria-label="Filter menu by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`menu-category-pill ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="terminal-product-wrap terminal-product-list terminal-product-grid">
          {products.length === 0 ? (
            <p className="no-products">No active products available</p>
          ) : filteredProducts.length === 0 ? (
            <p className="no-products">No products in this category.</p>
          ) : filteredProducts.map((product) => {
            const qty = Number(cartByTable?.[tableId]?.[product.id] || 0);
            const category = product?.category_name || "Uncategorized";

            return (
              <article key={product.id} className="menu-product-card">
                <div className="menu-product-top">
                  <span className="menu-product-category">{category}</span>
                  <strong>INR {Number(product.price || 0).toFixed(2)}</strong>
                </div>

                <h3>{product.name}</h3>

                <div className="qty-controls menu-qty-controls">
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
              </article>
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
