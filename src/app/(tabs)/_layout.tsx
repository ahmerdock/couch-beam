import "@/theme/unistyles";

import { CustomTabBar } from "@/components";
import { getTabBarStyle } from "@/constants/layout";
import { ROUTE_NAMES } from "@/constants/routes";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: getTabBarStyle(insets.bottom),
      }}
    >
      <Tabs.Screen name={ROUTE_NAMES.HOME} />
      <Tabs.Screen name={ROUTE_NAMES.HELP_ME} />
      <Tabs.Screen name={ROUTE_NAMES.SETTINGS} />
    </Tabs>
  );
}
