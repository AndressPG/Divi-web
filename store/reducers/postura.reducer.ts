import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import {AppState} from "../store";
import {Postura} from "../../types/Postura";

// Type for our state
export interface PosturaState {
    compras: Postura[];
    ventas: Postura[];
    amountToBuy: number;
    amountToSell: number;
}

// Initial state
const initialState: PosturaState = {
    compras: [],
    ventas: [],
    amountToBuy: 0,
    amountToSell: 0,
};

// Actual Slice
export const posturaSlice = createSlice({
    name: "posturas",
    initialState,
    reducers: {
        setPosturas(state, action: PayloadAction<{ compras: Postura[]; ventas: Postura[] }>) {
            return {
                ...state,
                compras: action.payload.compras,
                ventas: action.payload.ventas,
            }
        },
        setAmountToBuy(state, action: PayloadAction<number>) {
            return {
                ...state,
                amountToBuy: action.payload,
            }
        },
        setAmountToSell(state, action: PayloadAction<number>) {
            return {
                ...state,
                amountToSell: action.payload,
            }
        },
    },
    // Special reducer for hydrating the state. Special case for next-redux-wrapper
    extraReducers: {
        [HYDRATE]: (state, action) => {
            return {
                ...state,
                ...action.payload.posturas,
            };
        },
    },
});

export const { setPosturas, setAmountToBuy, setAmountToSell } = posturaSlice.actions;

export const selectPosturaState = (state: AppState) => state.posturas;

export default posturaSlice.reducer;
