import { AccessibilityInfo, Linking } from "react-native";
import Toast from "react-native-toast-message";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";
import { mmkvStorage, THEME_STORAGE_KEY } from "@/theme/unistyles";
import type { IUseSettingsReturn } from "./settings.interface";

export default function useSettings(): IUseSettingsReturn {
  const { rt } = useUnistyles();
  const isDark = rt.themeName === "dark";

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    UnistylesRuntime.setTheme(newTheme);
    mmkvStorage.set(THEME_STORAGE_KEY, newTheme);
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Toast.show({ type: "error", text1: "Couldn't open the link" });
      AccessibilityInfo.announceForAccessibility("Couldn't open the link");
    }
  };

  return {
    isDark,
    toggleTheme,
    openLink,
  };
}
