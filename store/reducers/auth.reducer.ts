import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import {AppState} from "../store";

// Type for our state
export interface AuthState {
    id: string,
    first_name: string,
    last_name: string,
    email: string,
    status: string,
    role: string,
    "token": string,
    id_casa_cambio: number,
    isLoggedIn: boolean
}

// Initial state
const initialState: AuthState = {
    email: null,
    first_name: null,
    role: null,
    last_name: null,
    id_casa_cambio: null,
    status: null,
    id: null,
    isLoggedIn: false,
    token: null
};

// Actual Slice
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthState(state, action) {
            return {
                ...state,
                ...action.payload,
            }
        },
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            console.log(action.payload);
            return {
                ...state,
            };
        },
    },
});

export const { setAuthState } = authSlice.actions;

export const selectAuthState = (state: AppState) => state.auth;

export default authSlice.reducer;
