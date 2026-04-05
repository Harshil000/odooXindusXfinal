  import "../styles/payment.scss";
import usePayment from "../hook/usePayment";

const formatDate = (value) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return value;
  }
};

const methodLabels = {
  cash: "Cash",
  netbanking: "Netbanking",
  unknown: "Other",
};

const Payment = () => {
  const { groupedPayments, totals, loading, error } = usePayment();
  const categories = ["cash", "netbanking"];

  return (
    <main className="payment-page">
      <div className="page-header">
        <h1>Payments</h1>
        <p className="payment-note">
          Review payment history grouped by cash and netbanking.
        </p>
      </div>

      <div className="payment-card payment-summary-card">
        <div className="card-header">
          <h2>Payment Summary</h2>
        </div>
        <div className="payment-detail payment-summary-grid">
          {categories.map((category) => (
            <div key={category} className="payment-summary-item">
              <span>{methodLabels[category]}</span>
              <strong>₹{(totals[category] || 0).toFixed(2)}</strong>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="payment-card payment-loading">
          Loading payment history...
        </div>
      ) : error ? (
        <div className="payment-card payment-error">{error}</div>
      ) : (
        <div className="payment-card payment-history-card">
          <div className="card-header">
            <h2>Payment History</h2>
          </div>

          {categories.map((category) => {
            const records = groupedPayments[category] || [];
            return (
              <section key={category} className="payment-category">
                <div className="payment-category-header">
                  <div>
                    <h3>{methodLabels[category]}</h3>
                    <p>{records.length} transactions</p>
                  </div>
                  <div className="payment-category-total">
                    ₹{(totals[category] || 0).toFixed(2)}
                  </div>
                </div>

                {records.length > 0 ? (
                  <table className="payment-history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((payment) => (
                        <tr key={payment.id}>
                          <td>{formatDate(payment.paid_at)}</td>
                          <td>₹{Number(payment.amount).toFixed(2)}</td>
                          <td>{payment.status || "unknown"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="payment-note">No payments recorded yet.</p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Payment;
