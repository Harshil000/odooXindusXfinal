export const initialProductState = {
  products: [],
  categories: [],
  loading: false,
  saving: false,
  error: null,
  formError: null,
};

export const ProductActionTypes = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  FETCH_CATEGORIES_SUCCESS: "FETCH_CATEGORIES_SUCCESS",
  CREATE_START: "CREATE_START",
  CREATE_SUCCESS: "CREATE_SUCCESS",
  CREATE_ERROR: "CREATE_ERROR",
  UPDATE_START: "UPDATE_START",
  UPDATE_SUCCESS: "UPDATE_SUCCESS",
  UPDATE_ERROR: "UPDATE_ERROR",
  DELETE_START: "DELETE_START",
  DELETE_SUCCESS: "DELETE_SUCCESS",
  DELETE_ERROR: "DELETE_ERROR",
  CATEGORY_CREATE_SUCCESS: "CATEGORY_CREATE_SUCCESS",
};

export const productReducer = (state, action) => {
  switch (action.type) {
    case ProductActionTypes.FETCH_START:
      return { ...state, loading: true, error: null };
    case ProductActionTypes.FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        products: action.payload.products,
        error: null,
      };
    case ProductActionTypes.FETCH_CATEGORIES_SUCCESS:
      return { ...state, categories: action.payload.categories };
    case ProductActionTypes.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ProductActionTypes.CREATE_START:
    case ProductActionTypes.UPDATE_START:
    case ProductActionTypes.DELETE_START:
      return { ...state, saving: true, formError: null };
    case ProductActionTypes.CREATE_SUCCESS:
      return {
        ...state,
        saving: false,
        products: [action.payload.product, ...state.products],
      };
    case ProductActionTypes.UPDATE_SUCCESS:
      return {
        ...state,
        saving: false,
        products: state.products.map((product) =>
          product.id === action.payload.product.id
            ? action.payload.product
            : product,
        ),
      };
    case ProductActionTypes.DELETE_SUCCESS:
      return {
        ...state,
        saving: false,
        products: state.products.filter(
          (product) => product.id !== action.payload.id,
        ),
      };
    case ProductActionTypes.CATEGORY_CREATE_SUCCESS:
      return {
        ...state,
        categories: [action.payload.category, ...state.categories],
      };
    case ProductActionTypes.CREATE_ERROR:
    case ProductActionTypes.UPDATE_ERROR:
    case ProductActionTypes.DELETE_ERROR:
      return { ...state, saving: false, formError: action.payload };
    default:
      return state;
  }
};
