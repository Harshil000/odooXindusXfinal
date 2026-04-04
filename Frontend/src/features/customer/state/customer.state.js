export const initialCustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  saving: false,
  error: null,
  formError: null,
};

export const CustomerActionTypes = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  SELECT_CUSTOMER: "SELECT_CUSTOMER",
  CREATE_START: "CREATE_START",
  CREATE_SUCCESS: "CREATE_SUCCESS",
  CREATE_ERROR: "CREATE_ERROR",
  UPDATE_START: "UPDATE_START",
  UPDATE_SUCCESS: "UPDATE_SUCCESS",
  UPDATE_ERROR: "UPDATE_ERROR",
  DELETE_START: "DELETE_START",
  DELETE_SUCCESS: "DELETE_SUCCESS",
  DELETE_ERROR: "DELETE_ERROR",
};

export const customerReducer = (state, action) => {
  switch (action.type) {
    case CustomerActionTypes.FETCH_START:
      return { ...state, loading: true, error: null };
    case CustomerActionTypes.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: action.payload.customers,
        error: null,
      };
    case CustomerActionTypes.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case CustomerActionTypes.SELECT_CUSTOMER:
      return {
        ...state,
        selectedCustomer: action.payload.customer,
        formError: null,
      };
    case CustomerActionTypes.CREATE_START:
    case CustomerActionTypes.UPDATE_START:
    case CustomerActionTypes.DELETE_START:
      return { ...state, saving: true, formError: null };
    case CustomerActionTypes.CREATE_SUCCESS:
      return {
        ...state,
        saving: false,
        customers: [action.payload.customer, ...state.customers],
        selectedCustomer: action.payload.customer,
      };
    case CustomerActionTypes.UPDATE_SUCCESS:
      return {
        ...state,
        saving: false,
        customers: state.customers.map((customer) =>
          customer.id === action.payload.customer.id
            ? action.payload.customer
            : customer,
        ),
        selectedCustomer: action.payload.customer,
      };
    case CustomerActionTypes.DELETE_SUCCESS:
      return {
        ...state,
        saving: false,
        customers: state.customers.filter(
          (customer) => customer.id !== action.payload.id,
        ),
        selectedCustomer:
          state.selectedCustomer?.id === action.payload.id
            ? null
            : state.selectedCustomer,
      };
    case CustomerActionTypes.CREATE_ERROR:
    case CustomerActionTypes.UPDATE_ERROR:
    case CustomerActionTypes.DELETE_ERROR:
      return { ...state, saving: false, formError: action.payload };
    default:
      return state;
  }
};
