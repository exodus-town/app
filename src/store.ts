import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { AnyAction, ThunkDispatch, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/dist/query/react";
import { Env } from "@dcl/ui-env";
import { reducer } from "./reducer";
import { config } from "./config";
import { api } from "./modules/api";

const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  devTools: config.is(Env.DEVELOPMENT),
});

setupListeners(store.dispatch);

export { store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunkDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
export const useAppDispatch: () => AppThunkDispatch =
  useDispatch<AppThunkDispatch>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
