import { Linking } from "react-native";
import { UnistylesRuntime, useUnistyles } from "react-native-unistyles";
import { mmkvStorage, THEME_STORAGE_KEY } from "@/theme/unistyles";
import { notify } from "@/utils/notify";
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
      notify("error", "Couldn't open the link");
    }
  };

  return {
    isDark,
    toggleTheme,
    openLink,
  };
}
