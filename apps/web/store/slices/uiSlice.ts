import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  theme: "light" | "dark";
  primaryColor: string;
  logoUrl: string;
  direction: "ltr" | "rtl";
  socketStatus: "connected" | "disconnected" | "connecting";
}

const initialState: UIState = {
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  theme: "dark",
  primaryColor: "#c3f5ff",
  logoUrl: "/logo.png",
  direction: "ltr",
  socketStatus: "disconnected",
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
    setLogoUrl: (state, action: PayloadAction<string>) => {
      state.logoUrl = action.payload;
    },
    setDirection: (state, action: PayloadAction<"ltr" | "rtl">) => {
      state.direction = action.payload;
    },
    setSocketStatus: (
      state,
      action: PayloadAction<"connected" | "disconnected" | "connecting">,
    ) => {
      state.socketStatus = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleCommandPalette,
  setTheme,
  setPrimaryColor,
  setLogoUrl,
  setDirection,
  setSocketStatus,
} = uiSlice.actions;
export default uiSlice.reducer;
