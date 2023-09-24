import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import {AppState} from "../store";
import {Bank} from "../../types/Bank";

// Type for our state
export interface BankState {
    banks: Bank[];
}

// Initial state
const initialState: BankState = {
    banks: [],
};

// Actual Slice
export const bankSlice = createSlice({
    name: "banks",
    initialState,
    reducers: {
        setBanks(state, action: PayloadAction<Bank[]>) {
            return {
                ...state,
                banks: action.payload,
            }
        },
    },
    // Special reducer for hydrating the state. Special case for next-redux-wrapper
    extraReducers: {
        [HYDRATE]: (state, action) => {
            return {
                ...state,
                ...action.payload.banks,
            };
        },
    },
});

export const { setBanks } = bankSlice.actions;

export const selectBankState = (state: AppState) => state.banks;

export default bankSlice.reducer;
