import { Store, combineReducers } from "redux";
import auction from "./modules/auction";

export const reducer = combineReducers({
  auction,
});

export type RootState = ReturnType<typeof reducer>;
export type RootStore = Store<RootState>;
