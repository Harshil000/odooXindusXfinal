import { useCallback, useMemo, useReducer } from "react";
import { createFloor, deleteFloor, getFloors } from "../services/floor.api";
import { createTable, deleteTable, getTables } from "../services/table.api";
import {
  initialSettingState,
  SettingActionTypes,
  settingReducer,
} from "../state/setting.state";

const useRestaurantLayout = () => {
  const [state, dispatch] = useReducer(settingReducer, initialSettingState);

  const loadLayout = useCallback(async () => {
    dispatch({ type: SettingActionTypes.FETCH_START });
    try {
      const [floors, tables] = await Promise.all([getFloors(), getTables()]);
      dispatch({
        type: SettingActionTypes.FETCH_SUCCESS,
        payload: { floors, tables },
      });
    } catch (error) {
      dispatch({
        type: SettingActionTypes.FETCH_ERROR,
        payload: error?.message || "Unable to load table and floor data",
      });
    }
  }, []);

  const setFloorName = useCallback((value) => {
    dispatch({ type: SettingActionTypes.SET_FLOOR_NAME, payload: value });
  }, []);

  const setTableField = useCallback((name, value) => {
    dispatch({
      type: SettingActionTypes.SET_TABLE_FIELD,
      payload: { name, value },
    });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: SettingActionTypes.CLEAR_ERROR });
  }, []);

  const addFloor = useCallback(async () => {
    if (!state.floorName.trim()) return;
    dispatch({ type: SettingActionTypes.CREATE_START });
    try {
      const floor = await createFloor({ name: state.floorName.trim() });
      dispatch({ type: SettingActionTypes.FLOOR_CREATE_SUCCESS, payload: { floor } });
    } catch (error) {
      dispatch({
        type: SettingActionTypes.CREATE_ERROR,
        payload: error?.message || "Could not create floor",
      });
    }
  }, [state.floorName]);

  const removeFloor = useCallback(async (floorId) => {
    dispatch({ type: SettingActionTypes.CREATE_START });
    try {
      await deleteFloor(floorId);
      dispatch({ type: SettingActionTypes.FLOOR_DELETE_SUCCESS, payload: { floorId } });
    } catch (error) {
      dispatch({
        type: SettingActionTypes.CREATE_ERROR,
        payload: error?.message || "Could not delete floor",
      });
    }
  }, []);

  const addTable = useCallback(async () => {
    if (!state.tableForm.floor_id || !state.tableForm.table_number.trim() || !state.tableForm.seats) {
      return;
    }

    dispatch({ type: SettingActionTypes.CREATE_START });
    try {
      const table = await createTable({
        floor_id: state.tableForm.floor_id,
        table_number: state.tableForm.table_number.trim(),
        seats: Number(state.tableForm.seats),
      });
      dispatch({ type: SettingActionTypes.TABLE_CREATE_SUCCESS, payload: { table } });
    } catch (error) {
      dispatch({
        type: SettingActionTypes.CREATE_ERROR,
        payload: error?.message || "Could not create table",
      });
    }
  }, [state.tableForm]);

  const removeTable = useCallback(async (tableId) => {
    dispatch({ type: SettingActionTypes.CREATE_START });
    try {
      await deleteTable(tableId);
      dispatch({ type: SettingActionTypes.TABLE_DELETE_SUCCESS, payload: { tableId } });
    } catch (error) {
      dispatch({
        type: SettingActionTypes.CREATE_ERROR,
        payload: error?.message || "Could not remove table",
      });
    }
  }, []);

  const summary = useMemo(() => {
    const floorNameById = state.floors.reduce((acc, floor) => {
      acc[floor.id] = floor.name;
      return acc;
    }, {});

    const tableCountByFloor = state.tables.reduce((acc, table) => {
      acc[table.floor_id] = (acc[table.floor_id] || 0) + 1;
      return acc;
    }, {});

    const totalSeats = state.tables.reduce((sum, table) => sum + Number(table.seats || 0), 0);

    return {
      floorNameById,
      tableCountByFloor,
      totalSeats,
    };
  }, [state.floors, state.tables]);

  return {
    ...state,
    ...summary,
    loadLayout,
    clearError,
    setFloorName,
    setTableField,
    addFloor,
    removeFloor,
    addTable,
    removeTable,
  };
};

export default useRestaurantLayout;
