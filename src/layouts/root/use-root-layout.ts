import { useEffect } from "react";
import { useFonts } from "expo-font";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue/400Regular";
import { DMMono_400Regular } from "@expo-google-fonts/dm-mono/400Regular";
import { DMMono_500Medium } from "@expo-google-fonts/dm-mono/500Medium";
import { DMSans_400Regular } from "@expo-google-fonts/dm-sans/400Regular";
import { DMSans_500Medium } from "@expo-google-fonts/dm-sans/500Medium";
import { DMSans_700Bold } from "@expo-google-fonts/dm-sans/700Bold";
import * as SplashScreen from "expo-splash-screen";
import { useUnistyles } from "react-native-unistyles";
import { getTvRemoteStore } from "@/lib/tv-remote/tv-remote.store";

// A failed splash call must not become an unhandled rejection; the app still runs.
SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function useRootLayout() {
  const { rt } = useUnistyles();

  const [loaded, error] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded, error]);

  useEffect(() => {
    getTvRemoteStore()
      .autoConnect()
      .catch(() => undefined);
  }, []);

  return {
    isReady: loaded || !!error,
    statusBarStyle: rt.themeName === "dark" ? "light" : "dark",
  } as const;
}
