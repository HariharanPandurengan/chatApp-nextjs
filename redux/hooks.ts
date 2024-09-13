import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store'; // Adjust path as needed

// Create a typed version of useDispatch
export const useAppDispatch: () => AppDispatch = useDispatch;