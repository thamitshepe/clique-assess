// selectedLeagueReducer.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for the selected sport
interface SelectedLeagueState {
  selectedLeague: string | null; // Update the interface to include 'selectedLeague'
}

const initialState: SelectedLeagueState = {
  selectedLeague: null,
};

// Create a slice for managing the selected sport state
const selectedLeagueSlice = createSlice({
  name: 'selectedLeague',
  initialState,
  reducers: {
    // Action to set the selected sport
    setSelectedLeague: (state, action: PayloadAction<string>) => {
      state.selectedLeague = action.payload;
    },
    // Action to clear the selected sport
    clearSelectedLeague: (state) => {
      state.selectedLeague = null;
    },
  },
});

// Export the reducer function and action creators
export const { setSelectedLeague, clearSelectedLeague } = selectedLeagueSlice.actions;
export default selectedLeagueSlice.reducer;