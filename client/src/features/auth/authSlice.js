import { createSlice } from "@reduxjs/toolkit";

const getInitialState = () => {
  try {
    const storedAuth = localStorage.getItem("fms_auth");
    if (storedAuth) {
      return JSON.parse(storedAuth);
    }
  } catch (e) {
    localStorage.removeItem("fms_auth");
  }
  return {
    user: null,
    role: null,
    token: null,
    isAuthenticated: false,
    status: "idle",
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginStart(state) {
      state.status = "loading";
    },
    loginSuccess(state, action) {
      const user = action.payload.user;
      const token = action.payload.token;
      state.user = user;
      state.role = user ? user.role : null;
      state.token = token;
      state.isAuthenticated = true;
      state.status = "authenticated";

      localStorage.setItem(
        "fms_auth",
        JSON.stringify({
          user,
          role: user ? user.role : null,
          token,
          isAuthenticated: true,
          status: "authenticated",
        })
      );
    },
    loginFailure(state) {
      state.status = "failed";
    },
    logout(state) {
      state.user = null;
      state.role = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = "idle";
      localStorage.removeItem("fms_auth");
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
