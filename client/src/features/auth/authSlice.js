import { createSlice } from "@reduxjs/toolkit";

const storedAuth = localStorage.getItem("fms_auth");

const initialState = storedAuth
  ? JSON.parse(storedAuth)
  : {
      user: null,
      token: null,
      isAuthenticated: false,
      status: "idle",
    };

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginStart(state) {
      state.status = "loading";
    },

    loginSuccess(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.status = "authenticated";

      localStorage.setItem(
        "fms_auth",
        JSON.stringify({
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          status: "authenticated",
        }),
      );
    },

    loginFailure(state) {
      state.status = "failed";
    },

    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = "idle";

      localStorage.removeItem("fms_auth");
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;