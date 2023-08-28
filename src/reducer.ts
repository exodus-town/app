import { Store, combineReducers } from "redux";
import { api } from "./modules/api";

export const reducer = combineReducers({
  [api.reducerPath]: api.reducer,
});

export type RootState = ReturnType<typeof reducer>;
export type RootStore = Store<RootState>;
