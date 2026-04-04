export const initialPaymentState = {
  payments: [],
  groupedPayments: {},
  totals: {},
  loading: false,
  error: null,
};

export const PaymentActionTypes = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
};

export const paymentReducer = (state, action) => {
  switch (action.type) {
    case PaymentActionTypes.FETCH_START:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case PaymentActionTypes.FETCH_SUCCESS:
      return {
        ...state,
        payments: action.payload.payments,
        groupedPayments: action.payload.groupedPayments,
        totals: action.payload.totals,
        loading: false,
        error: null,
      };
    case PaymentActionTypes.FETCH_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload || "Unable to load payment history.",
      };
    default:
      return state;
  }
};
