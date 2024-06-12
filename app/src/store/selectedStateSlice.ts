// 1. Redux Setup - selectedStateSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedStateState {
  selectedState: string;
}

const initialState: SelectedStateState = {
  selectedState: 'Users', // Default value
};

const selectedStateSlice = createSlice({
  name: 'selectedState',
  initialState,
  reducers: {
    setSelectedState: (state, action: PayloadAction<string>) => {
      state.selectedState = action.payload;
    },
  },
});

export const { setSelectedState } = selectedStateSlice.actions;
export default selectedStateSlice.reducer;