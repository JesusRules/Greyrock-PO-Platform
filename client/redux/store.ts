import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import authReducer from './features/auth-slice';

export const store = configureStore({
    reducer: {
        authReducer,
    }
});

// NEED these for typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// export const useAppSelector = useSelector<RootState>
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector