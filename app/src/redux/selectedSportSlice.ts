// 1. Redux Setup - selectedSportSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedSportState {
  selectedSport: string;
}

const initialState: SelectedSportState = {
  selectedSport: 'football', // Default value
};

const selectedSportSlice = createSlice({
  name: 'selectedSport',
  initialState,
  reducers: {
    setSelectedSport: (state, action: PayloadAction<string>) => {
      state.selectedSport = action.payload;
    },
  },
});

export const { setSelectedSport } = selectedSportSlice.actions;
export default selectedSportSlice.reducer;
