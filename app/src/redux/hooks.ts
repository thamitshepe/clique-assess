// hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { selectSelectedDate } from './selectedDateSlice'; // Import the new selector

// Define types for useDispatch, useSelector, and useStore hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<RootState>();

// Add selectors for the new slice if needed
export const useSelectedDate = () => useAppSelector(selectSelectedDate);