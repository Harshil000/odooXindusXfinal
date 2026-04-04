export const initialCategoryState = {
  categories: [],
  loading: false,
  saving: false,
  error: null,
  formError: null,
};

export const CategoryActionTypes = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  CREATE_START: "CREATE_START",
  CREATE_SUCCESS: "CREATE_SUCCESS",
  CREATE_ERROR: "CREATE_ERROR",
  DELETE_START: "DELETE_START",
  DELETE_SUCCESS: "DELETE_SUCCESS",
  DELETE_ERROR: "DELETE_ERROR",
};

export const categoryReducer = (state, action) => {
  switch (action.type) {
    case CategoryActionTypes.FETCH_START:
      return { ...state, loading: true, error: null };
    case CategoryActionTypes.FETCH_SUCCESS:
      return { ...state, loading: false, categories: action.payload.categories, error: null };
    case CategoryActionTypes.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case CategoryActionTypes.CREATE_START:
    case CategoryActionTypes.DELETE_START:
      return { ...state, saving: true, formError: null };
    case CategoryActionTypes.CREATE_SUCCESS:
      return {
        ...state,
        saving: false,
        categories: [action.payload.category, ...state.categories],
      };
    case CategoryActionTypes.DELETE_SUCCESS:
      return {
        ...state,
        saving: false,
        categories: state.categories.filter((category) => category.id !== action.payload.id),
      };
    case CategoryActionTypes.CREATE_ERROR:
    case CategoryActionTypes.DELETE_ERROR:
      return { ...state, saving: false, formError: action.payload };
    default:
      return state;
  }
};
