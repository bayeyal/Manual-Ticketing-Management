import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import projectsReducer from './slices/projectsSlice';
import tasksReducer from './slices/tasksSlice';
import authReducer from './slices/authSlice';
import selectedProjectReducer from './slices/selectedProjectSlice';
import usersReducer from './slices/usersSlice';
import pagesReducer from './slices/pagesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    selectedProject: selectedProjectReducer,
    users: usersReducer,
    pages: pagesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; 