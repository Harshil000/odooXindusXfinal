import { useState } from "react";
import "../styles/payment-modal.scss";

const PaymentModal = ({
  isOpen,
  tableId,
  amount,
  busy,
  onClose,
  onPayByCash,
  onPayByNetbanking,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCashPayment = async () => {
    setIsProcessing(true);
    try {
      await onPayByCash(tableId);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNetbankingPayment = async () => {
    setIsProcessing(true);
    try {
      await onPayByNetbanking(tableId);
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

        <div className="payment-modal-actions">
          <button
            className="payment-method-btn cash-btn"
            onClick={handleCashPayment}
            disabled={isProcessing || busy}
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
            disabled={isProcessing || busy}
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
