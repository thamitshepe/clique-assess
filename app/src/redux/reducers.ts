// reducers.ts
import { combineReducers } from '@reduxjs/toolkit';
import selectedSportReducer from './selectedSportReducer'; // Import your existing reducers
import selectedDateReducer from './selectedDateSlice'; // Import the new slice reducer

const rootReducer = combineReducers({
  selectedSport: selectedSportReducer,
  selectedDate: selectedDateReducer, // Include the new slice reducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
