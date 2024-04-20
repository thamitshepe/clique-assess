// actions.ts
import { SET_SELECTED_SPORT } from './actionTypes';

export const setSelectedSport = (sport: string) => ({
  type: SET_SELECTED_SPORT,
  payload: sport,
});
