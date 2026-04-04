export const initialSettingState = {
  floors: [],
  tables: [],
  loading: false,
  saving: false,
  error: null,
  floorName: "",
  tableForm: {
    floor_id: "",
    table_number: "",
    seats: "",
  },
};

export const SettingActionTypes = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  SET_FLOOR_NAME: "SET_FLOOR_NAME",
  SET_TABLE_FIELD: "SET_TABLE_FIELD",
  CREATE_START: "CREATE_START",
  CREATE_ERROR: "CREATE_ERROR",
  FLOOR_CREATE_SUCCESS: "FLOOR_CREATE_SUCCESS",
  FLOOR_DELETE_SUCCESS: "FLOOR_DELETE_SUCCESS",
  TABLE_CREATE_SUCCESS: "TABLE_CREATE_SUCCESS",
  TABLE_DELETE_SUCCESS: "TABLE_DELETE_SUCCESS",
  CLEAR_ERROR: "CLEAR_ERROR",
};

const sortFloors = (floors) => [...floors].sort((a, b) => a.name.localeCompare(b.name));

export const settingReducer = (state, action) => {
  switch (action.type) {
    case SettingActionTypes.FETCH_START:
      return { ...state, loading: true, error: null };

    case SettingActionTypes.FETCH_SUCCESS: {
      const floors = action.payload.floors || [];
      const tables = action.payload.tables || [];
      const selectedFloor = state.tableForm.floor_id || floors[0]?.id || "";
      return {
        ...state,
        loading: false,
        floors: sortFloors(floors),
        tables,
        tableForm: { ...state.tableForm, floor_id: selectedFloor },
      };
    }

    case SettingActionTypes.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };

    case SettingActionTypes.SET_FLOOR_NAME:
      return { ...state, floorName: action.payload };

    case SettingActionTypes.SET_TABLE_FIELD:
      return {
        ...state,
        tableForm: {
          ...state.tableForm,
          [action.payload.name]: action.payload.value,
        },
      };

    case SettingActionTypes.CREATE_START:
      return { ...state, saving: true, error: null };

    case SettingActionTypes.CREATE_ERROR:
      return { ...state, saving: false, error: action.payload };

    case SettingActionTypes.FLOOR_CREATE_SUCCESS: {
      const nextFloors = sortFloors([...state.floors, action.payload.floor]);
      const floor_id = state.tableForm.floor_id || action.payload.floor.id;
      return {
        ...state,
        saving: false,
        floors: nextFloors,
        floorName: "",
        tableForm: { ...state.tableForm, floor_id },
      };
    }

    case SettingActionTypes.FLOOR_DELETE_SUCCESS: {
      const floorId = action.payload.floorId;
      const floor_id = state.tableForm.floor_id === floorId ? "" : state.tableForm.floor_id;
      return {
        ...state,
        saving: false,
        floors: state.floors.filter((floor) => floor.id !== floorId),
        tables: state.tables.filter((table) => table.floor_id !== floorId),
        tableForm: { ...state.tableForm, floor_id },
      };
    }

    case SettingActionTypes.TABLE_CREATE_SUCCESS:
      return {
        ...state,
        saving: false,
        tables: [action.payload.table, ...state.tables],
        tableForm: {
          ...state.tableForm,
          table_number: "",
          seats: "",
        },
      };

    case SettingActionTypes.TABLE_DELETE_SUCCESS:
      return {
        ...state,
        saving: false,
        tables: state.tables.filter((table) => table.id !== action.payload.tableId),
      };

    case SettingActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};
