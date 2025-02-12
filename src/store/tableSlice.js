import { createSlice } from '@reduxjs/toolkit';

const tableSlice = createSlice({
  name: 'table',
  initialState: {
    data: [],
    selectedRows: [],
    collapsedParts: {},
    editingState: {
      rowId: null,
      field: null
    }
  },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
    setSelectedRows: (state, action) => {
      state.selectedRows = action.payload;
    },
    setCollapsedParts: (state, action) => {
      state.collapsedParts = action.payload;
    },
    setEditingState: (state, action) => {
      state.editingState = action.payload;
    }
  }
});

export const { setData, setSelectedRows, setCollapsedParts, setEditingState } = tableSlice.actions;
export default tableSlice.reducer; 