import { AnyAction, ThunkDispatch, configureStore } from "@reduxjs/toolkit";
import { Env } from "@dcl/ui-env";
import { reducer } from "./reducer";
import { config } from "./config";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

const store = configureStore({
  reducer,
  devTools: config.is(Env.DEVELOPMENT),
});

export { store };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunkDispatch = ThunkDispatch<RootState, unknown, AnyAction>;
export const useAppDispatch: () => AppThunkDispatch =
  useDispatch<AppThunkDispatch>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
