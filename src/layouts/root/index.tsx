import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ROUTE_NAMES } from "@/constants/routes";
import { rootStyles } from "./root.styles";
import useRootLayout from "./use-root-layout";

export default function RootLayout() {
  const { isReady, statusBarStyle } = useRootLayout();

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={rootStyles.container}>
      <SafeAreaProvider>
        <StatusBar style={statusBarStyle} />
        <Stack>
          <Stack.Screen
            name={ROUTE_NAMES.TABS}
            options={{ headerShown: false }}
          />
        </Stack>
        <Toast position="bottom" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
