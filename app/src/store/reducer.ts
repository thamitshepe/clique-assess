// reducers.ts
import { combineReducers } from '@reduxjs/toolkit';
import selectedSportReducer from './selectedSportReducer'; // Import your existing reducers

const rootReducer = combineReducers({
  selectedSport: selectedSportReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;