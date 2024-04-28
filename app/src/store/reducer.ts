// reducers.ts
import { combineReducers } from '@reduxjs/toolkit';
import selectedLeagueReducer from './selectedLeagueReducer';
import selectedSportReducer from './selectedSportReducer'; // Import your existing reducers

const rootReducer = combineReducers({
  selectedSport: selectedSportReducer,
  selectedLeague: selectedLeagueReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;