import { useEffect, useReducer } from "react";
import { getPaymentHistory } from "../services/payment.api";
import {
  initialPaymentState,
  paymentReducer,
  PaymentActionTypes,
} from "../state/payment.state";

const normalizeMethod = (payment_method) =>
  payment_method === "razorpay" ? "netbanking" : payment_method;

const normalizeStatus = (status) =>
  status === "completed" ? "paid" : status;

const formatPayment = (payment) => ({
  ...payment,
  payment_method: normalizeMethod(payment.payment_method),
  status: payment.razorpay_payment_id
    ? "paid"
    : normalizeStatus(payment.status),
});

const groupByMethod = (payments) =>
  payments.reduce((grouped, payment) => {
    const method = payment.payment_method || "unknown";
    if (!grouped[method]) grouped[method] = [];
    grouped[method].push(payment);
    return grouped;
  }, {});

const calculateTotals = (groupedPayments) =>
  Object.fromEntries(
    Object.entries(groupedPayments).map(([method, items]) => [
      method,
      items.reduce((sum, payment) => sum + Number(payment.amount), 0),
    ]),
  );

const usePayment = () => {
  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);

  const loadHistory = async () => {
    dispatch({ type: PaymentActionTypes.FETCH_START });

    try {
      const data = await getPaymentHistory();
      const payments = data.payments.map(formatPayment);
      const groupedPayments = groupByMethod(payments);
      const totals = calculateTotals(groupedPayments);

      dispatch({
        type: PaymentActionTypes.FETCH_SUCCESS,
        payload: { payments, groupedPayments, totals },
      });
    } catch (error) {
      dispatch({
        type: PaymentActionTypes.FETCH_ERROR,
        payload: error?.error || error?.message || String(error),
      });
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return {
    ...state,
    loadHistory,
  };
};

export default usePayment;
