import { StyleSheet } from "react-native-unistyles";
import { createMMKV } from "react-native-mmkv";

export const mmkvStorage = createMMKV();
export const THEME_STORAGE_KEY = "app_theme";

const typography = {
  heading: {
    regular: "BebasNeue_400Regular",
  },
  body: {
    regular: "DMSans_400Regular",
    medium: "DMSans_500Medium",
    bold: "DMSans_700Bold",
  },
  mono: {
    regular: "DMMono_400Regular",
    medium: "DMMono_500Medium",
  },
};

const gap = (v: number) => v * 8;

const lightTheme = {
  colors: {
    primary: "#b63331",
    background: "#FDFDFD",
    backgroundSecondary: "#F0F0F0",
    text: "#121212",
    textSecondary: "#12121299",
    onPrimary: "#FDFDFD",
    warning: "#B45309",
  },
  typography,
  gap,
};

const darkTheme = {
  colors: {
    primary: "#b63331",
    background: "#0D0C0C",
    backgroundSecondary: "#1C1C1C",
    text: "#FDFDFD",
    textSecondary: "#FDFDFD80",
    onPrimary: "#FDFDFD",
    warning: "#F5A524",
  },
  typography,
  gap,
};

const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

type AppThemes = typeof appThemes;

declare module "react-native-unistyles" {
  // Unistyles requires an interface here to add our themes to its types.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesThemes extends AppThemes {}
}

const storedTheme = mmkvStorage.getString(THEME_STORAGE_KEY);
const savedTheme =
  storedTheme === "light" || storedTheme === "dark" ? storedTheme : undefined;

StyleSheet.configure({
  settings: {
    initialTheme: savedTheme ?? "dark",
  },
  themes: appThemes,
});
