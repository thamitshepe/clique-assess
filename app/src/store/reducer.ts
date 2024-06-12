// reducers.ts
import { combineReducers } from '@reduxjs/toolkit';
import selectedStateReducer from './selectedStateReducer'; // Import your existing reducers

const rootReducer = combineReducers({
  selectedState: selectedStateReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;