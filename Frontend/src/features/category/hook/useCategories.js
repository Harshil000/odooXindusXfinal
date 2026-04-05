import { useEffect, useReducer, useCallback } from "react";
import { getCategories, createCategory, deleteCategory, updateCategory } from "../services/category.api";
import { initialCategoryState, categoryReducer, CategoryActionTypes } from "../state/category.state";

const useCategories = () => {
  const [state, dispatch] = useReducer(categoryReducer, initialCategoryState);

  const loadCategories = useCallback(async () => {
    dispatch({ type: CategoryActionTypes.FETCH_START });
    try {
      const response = await getCategories();
      dispatch({ type: CategoryActionTypes.FETCH_SUCCESS, payload: { categories: response } });
    } catch (error) {
      dispatch({ type: CategoryActionTypes.FETCH_ERROR, payload: error?.message || error?.error || "Unable to load categories" });
    }
  }, []);

  const createNewCategory = useCallback(async (categoryData) => {
    dispatch({ type: CategoryActionTypes.CREATE_START });
    try {
      const response = await createCategory(categoryData);
      dispatch({ type: CategoryActionTypes.CREATE_SUCCESS, payload: { category: response } });
    } catch (error) {
      dispatch({ type: CategoryActionTypes.CREATE_ERROR, payload: error?.message || error?.error || "Could not create category" });
    }
  }, []);

  const deleteExistingCategory = useCallback(async (id) => {
    dispatch({ type: CategoryActionTypes.DELETE_START });
    try {
      await deleteCategory(id);
      dispatch({ type: CategoryActionTypes.DELETE_SUCCESS, payload: { id } });
    } catch (error) {
      dispatch({ type: CategoryActionTypes.DELETE_ERROR, payload: error?.message || error?.error || "Could not delete category" });
    }
  }, []);

  const updateExistingCategory = useCallback(async (id, categoryData) => {
    dispatch({ type: CategoryActionTypes.UPDATE_START });
    try {
      const response = await updateCategory(id, categoryData);
      dispatch({ type: CategoryActionTypes.UPDATE_SUCCESS, payload: { category: response } });
      return true;
    } catch (error) {
      dispatch({ type: CategoryActionTypes.UPDATE_ERROR, payload: error?.message || error?.error || "Could not update category" });
      return false;
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    ...state,
    loadCategories,
    createNewCategory,
    deleteExistingCategory,
    updateExistingCategory,
  };
};

export default useCategories;
