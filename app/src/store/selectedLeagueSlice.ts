// 1. Redux Setup - selectedLeagueSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedLeagueState {
  selectedLeague: string;
}

const initialState: SelectedLeagueState = {
  selectedLeague: 'PL', // Default value
};

const selectedLeagueSlice = createSlice({
  name: 'selectedLeague',
  initialState,
  reducers: {
    setSelectedLeague: (state, action: PayloadAction<string>) => {
      state.selectedLeague = action.payload;
    },
  },
});

export const { setSelectedLeague } = selectedLeagueSlice.actions;
export default selectedLeagueSlice.reducer;