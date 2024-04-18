// selectedSportReducer.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for the selected sport
interface SelectedSportState {
  selectedSport: string | null; // Update the interface to include 'selectedSport'
}

const initialState: SelectedSportState = {
  selectedSport: null,
};

// Create a slice for managing the selected sport state
const selectedSportSlice = createSlice({
  name: 'selectedSport',
  initialState,
  reducers: {
    // Action to set the selected sport
    setSelectedSport: (state, action: PayloadAction<string>) => {
      state.selectedSport = action.payload;
    },
    // Action to clear the selected sport
    clearSelectedSport: (state) => {
      state.selectedSport = null;
    },
  },
});

// Export the reducer function and action creators
export const { setSelectedSport, clearSelectedSport } = selectedSportSlice.actions;
export default selectedSportSlice.reducer;