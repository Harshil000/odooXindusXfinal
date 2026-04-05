import { useEffect, useState } from "react";

const CustomerDetailsModal = ({
  isOpen,
  tableNumber,
  initialName,
  initialEmail,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(initialName || "");
    setEmail(initialEmail || "");
  }, [isOpen, initialName, initialEmail]);

  if (!isOpen) return null;

  return (
    <div className="terminal-modal-overlay" onClick={onClose}>
      <div className="terminal-modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="terminal-modal-header">
          <h2>Engage Table {tableNumber}</h2>
          <button type="button" className="terminal-close-btn" onClick={onClose}>
            x
          </button>
        </div>

        <p className="terminal-modal-subtitle">
          Enter customer details before opening the menu. Receipt will be sent on payment.
        </p>

        <label className="terminal-field">
          <span>Customer Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter customer name"
          />
        </label>

        <label className="terminal-field">
          <span>Customer Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter customer email"
          />
        </label>

        <div className="terminal-modal-actions">
          <button type="button" className="btn btn-subtle" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onConfirm({ name: name.trim(), email: email.trim() })}
            disabled={!name.trim() || !email.trim()}
          >
            Continue to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsModal;
