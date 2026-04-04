import { useEffect, useReducer, useCallback } from "react";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customer.api";
import {
  initialCustomerState,
  customerReducer,
  CustomerActionTypes,
} from "../state/customer.state";

const useCustomers = () => {
  const [state, dispatch] = useReducer(customerReducer, initialCustomerState);

  const loadCustomers = useCallback(async () => {
    dispatch({ type: CustomerActionTypes.FETCH_START });
    try {
      const response = await getCustomers();
      dispatch({
        type: CustomerActionTypes.FETCH_SUCCESS,
        payload: { customers: response },
      });
    } catch (error) {
      dispatch({
        type: CustomerActionTypes.FETCH_ERROR,
        payload: error?.message || error?.error || "Unable to load customers",
      });
    }
  }, []);

  const selectCustomer = useCallback((customer) => {
    dispatch({
      type: CustomerActionTypes.SELECT_CUSTOMER,
      payload: { customer },
    });
  }, []);

  const createNewCustomer = useCallback(async (customerData) => {
    dispatch({ type: CustomerActionTypes.CREATE_START });
    try {
      const response = await createCustomer(customerData);
      dispatch({
        type: CustomerActionTypes.CREATE_SUCCESS,
        payload: { customer: response },
      });
    } catch (error) {
      dispatch({
        type: CustomerActionTypes.CREATE_ERROR,
        payload: error?.message || error?.error || "Could not create customer",
      });
    }
  }, []);

  const updateExistingCustomer = useCallback(async (id, customerData) => {
    dispatch({ type: CustomerActionTypes.UPDATE_START });
    try {
      const response = await updateCustomer(id, customerData);
      dispatch({
        type: CustomerActionTypes.UPDATE_SUCCESS,
        payload: { customer: response },
      });
    } catch (error) {
      dispatch({
        type: CustomerActionTypes.UPDATE_ERROR,
        payload: error?.message || error?.error || "Could not update customer",
      });
    }
  }, []);

  const deleteExistingCustomer = useCallback(async (id) => {
    dispatch({ type: CustomerActionTypes.DELETE_START });
    try {
      await deleteCustomer(id);
      dispatch({ type: CustomerActionTypes.DELETE_SUCCESS, payload: { id } });
    } catch (error) {
      dispatch({
        type: CustomerActionTypes.DELETE_ERROR,
        payload: error?.message || error?.error || "Could not delete customer",
      });
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    ...state,
    loadCustomers,
    selectCustomer,
    createNewCustomer,
    updateExistingCustomer,
    deleteExistingCustomer,
  };
};

export default useCustomers;
