// selectedDateSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

// Define the initial state
interface SelectedDateState {
  selectedDate: Date | null;
}

const initialState: SelectedDateState = {
  selectedDate: null,
};

// Define the slice
const selectedDateSlice = createSlice({
  name: 'selectedDate',
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<Date>) {
      state.selectedDate = action.payload;
    },
  },
});

// Export the action creator
export const { setSelectedDate } = selectedDateSlice.actions;

// Define a selector to retrieve the selected date
export const selectSelectedDate = (state: RootState) => state.selectedDate.selectedDate;

// Export the reducer
export default selectedDateSlice.reducer;
