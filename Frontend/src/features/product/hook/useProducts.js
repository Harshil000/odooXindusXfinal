import { useEffect, useReducer, useCallback } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
} from "../services/product.api";
import {
  initialProductState,
  productReducer,
  ProductActionTypes,
} from "../state/product.state";

const useProducts = () => {
  const [state, dispatch] = useReducer(productReducer, initialProductState);

  const loadProducts = useCallback(async () => {
    dispatch({ type: ProductActionTypes.FETCH_START });
    try {
      const response = await getProducts();
      dispatch({
        type: ProductActionTypes.FETCH_SUCCESS,
        payload: { products: response },
      });
    } catch (error) {
      dispatch({
        type: ProductActionTypes.FETCH_ERROR,
        payload: error?.message || error?.error || "Unable to load products",
      });
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await getCategories();
      dispatch({
        type: ProductActionTypes.FETCH_CATEGORIES_SUCCESS,
        payload: { categories: response },
      });
    } catch (error) {
      console.error("Unable to load categories", error);
    }
  }, []);

  const createNewProduct = useCallback(async (productData) => {
    dispatch({ type: ProductActionTypes.CREATE_START });
    try {
      const response = await createProduct(productData);
      dispatch({
        type: ProductActionTypes.CREATE_SUCCESS,
        payload: { product: response },
      });
      return response;
    } catch (error) {
      const message = error?.message || error?.error || "Could not create product";
      dispatch({
        type: ProductActionTypes.CREATE_ERROR,
        payload: message,
      });
      throw new Error(message);
    }
  }, []);

  const updateExistingProduct = useCallback(async (id, productData) => {
    dispatch({ type: ProductActionTypes.UPDATE_START });
    try {
      const response = await updateProduct(id, productData);
      dispatch({
        type: ProductActionTypes.UPDATE_SUCCESS,
        payload: { product: response },
      });
      return response;
    } catch (error) {
      const message = error?.message || error?.error || "Could not update product";
      dispatch({
        type: ProductActionTypes.UPDATE_ERROR,
        payload: message,
      });
      throw new Error(message);
    }
  }, []);

  const deleteExistingProduct = useCallback(async (id) => {
    dispatch({ type: ProductActionTypes.DELETE_START });
    try {
      await deleteProduct(id);
      dispatch({ type: ProductActionTypes.DELETE_SUCCESS, payload: { id } });
      return true;
    } catch (error) {
      const message = error?.message || error?.error || "Could not delete product";
      dispatch({
        type: ProductActionTypes.DELETE_ERROR,
        payload: message,
      });
      throw new Error(message);
    }
  }, []);

  const createNewCategory = useCallback(async (categoryData) => {
    dispatch({ type: ProductActionTypes.CREATE_START });
    try {
      const response = await createCategory(categoryData);
      dispatch({
        type: ProductActionTypes.CATEGORY_CREATE_SUCCESS,
        payload: { category: response },
      });
      return response;
    } catch (error) {
      const message = error?.message || error?.error || "Could not create category";
      dispatch({
        type: ProductActionTypes.CREATE_ERROR,
        payload: message,
      });
      throw new Error(message);
    }
  }, []);

  const updateExistingCategory = useCallback(async (id, categoryData) => {
    dispatch({ type: ProductActionTypes.UPDATE_START });
    try {
      const response = await updateCategory(id, categoryData);
      dispatch({
        type: ProductActionTypes.CATEGORY_UPDATE_SUCCESS,
        payload: { category: response },
      });
      return true;
    } catch (error) {
      const message = error?.message || error?.error || "Could not update category";
      dispatch({
        type: ProductActionTypes.UPDATE_ERROR,
        payload: message,
      });
      return false;
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  return {
    ...state,
    loadProducts,
    loadCategories,
    createNewProduct,
    updateExistingProduct,
    deleteExistingProduct,
    createNewCategory,
    updateExistingCategory,
  };
};

export default useProducts;
