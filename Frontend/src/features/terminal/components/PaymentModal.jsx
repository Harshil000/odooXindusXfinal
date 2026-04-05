import { useEffect, useState } from "react";
import "../styles/payment-modal.scss";

const PaymentModal = ({
  isOpen,
  tableId,
  amount,
  busy,
  initialCustomer,
  onClose,
  onPayByCash,
  onPayByNetbanking,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(initialCustomer?.name || "");
    setEmail(initialCustomer?.email || "");
  }, [isOpen, initialCustomer]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  const canProceed = Boolean(name.trim()) && isValidEmail;

  const handleCashPayment = async () => {
    if (!canProceed) return;
    setIsProcessing(true);
    try {
      await onPayByCash(tableId, { name: name.trim(), email: email.trim() });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNetbankingPayment = async () => {
    if (!canProceed) return;
    setIsProcessing(true);
    try {
      await onPayByNetbanking(tableId, { name: name.trim(), email: email.trim() });
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay" onClick={onClose}>
      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2>Select Payment Method</h2>
          <button className="modal-close-btn" onClick={onClose} disabled={isProcessing || busy}>
            ✕
          </button>
        </div>

        <div className="payment-modal-amount">
          <span>Amount to Pay:</span>
          <strong>₹{(amount || 0).toFixed(2)}</strong>
        </div>

        <div className="payment-customer-form">
          <label>
            <span>Customer Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter customer name"
              disabled={isProcessing || busy}
            />
          </label>

          <label>
            <span>Customer Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter customer email"
              disabled={isProcessing || busy}
            />
          </label>

          {!canProceed ? (
            <p className="payment-customer-hint">Enter valid name and email to send receipt after payment.</p>
          ) : null}
        </div>

        <div className="payment-modal-actions">
          <button
            className="payment-method-btn cash-btn"
            onClick={handleCashPayment}
            disabled={isProcessing || busy || !canProceed}
          >
            <div className="btn-icon">💵</div>
            <div className="btn-text">
              <strong>Pay by Cash</strong>
              <small>Pay with cash at counter</small>
            </div>
          </button>

          <button
            className="payment-method-btn netbanking-btn"
            onClick={handleNetbankingPayment}
            disabled={isProcessing || busy || !canProceed}
          >
            <div className="btn-icon">🏦</div>
            <div className="btn-text">
              <strong>Pay by UPI / Netbanking</strong>
              <small>Secure online payment through Razorpay</small>
            </div>
          </button>
        </div>

        {(isProcessing || busy) && (
          <div className="payment-processing">
            <p>Processing payment...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
