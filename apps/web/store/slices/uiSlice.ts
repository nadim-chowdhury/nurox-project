import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  theme: "light" | "dark";
  primaryColor: string;
  direction: "ltr" | "rtl";
}

const initialState: UIState = {
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  theme: "dark",
  primaryColor: "#00b96b",
  direction: "ltr",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleCommandPalette: (state) => {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.primaryColor = action.payload;
    },
    setDirection: (state, action: PayloadAction<"ltr" | "rtl">) => {
      state.direction = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleCommandPalette,
  setTheme,
  setPrimaryColor,
  setDirection,
} = uiSlice.actions;
export default uiSlice.reducer;
