// selectedStateReducer.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for the selected state
interface SelectedStateState {
  selectedState: string | null; // Update the interface to include 'selectedState'
}

const initialState: SelectedStateState = {
  selectedState: null,
};

// Create a slice for managing the selected state state
const selectedStateSlice = createSlice({
  name: 'selectedState',
  initialState,
  reducers: {
    // Action to set the selected state
    setSelectedState: (state, action: PayloadAction<string>) => {
      state.selectedState = action.payload;
    },
    // Action to clear the selected state
    clearSelectedState: (state) => {
      state.selectedState = null;
    },
  },
});

// Export the reducer function and action creators
export const { setSelectedState, clearSelectedState } = selectedStateSlice.actions;
export default selectedStateSlice.reducer;