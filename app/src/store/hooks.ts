// hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from 'react-redux';
import { RootState, AppDispatch } from './store';

// Define types for useDispatch, useSelector, and useStore hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = () => useStore<RootState>();
