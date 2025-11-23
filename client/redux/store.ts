import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import authReducer from './features/auth-slice';
import vendorsReducer from './features/vendors-slice';
import departmentsReducer from './features/departments-slice';
import usersReducer from './features/users-slice';
import purchaseOrdersRouter from './features/po-slice';
import notificationsRouter from './features/notifications-slice';

export const store = configureStore({
    reducer: {
        authReducer,
        vendorsReducer,
        departmentsReducer,
        usersReducer,
        purchaseOrdersRouter,
        notificationsRouter
    }
});

// NEED these for typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector