import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "expo-router/tabs";
import { ScreenTitle } from "@/components";
import { ITabsLayoutProps } from "./tabs.interface";
import { tabsStyles } from "./tabs.styles";

export default function TabsLayout(props: ITabsLayoutProps) {
  const { children, titleProps } = props;
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={tabsStyles.container}>
      <SafeAreaView
        edges={["top", "right", "left"]}
        style={tabsStyles.safeArea}
      >
        <ScreenTitle {...titleProps} />

        <ScrollView
          contentContainerStyle={tabsStyles.contentContainer(tabBarHeight)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        <View pointerEvents="none" style={tabsStyles.viewBox(tabBarHeight)} />
      </SafeAreaView>
    </View>
  );
}
