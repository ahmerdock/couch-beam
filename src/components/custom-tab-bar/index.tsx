import { View } from "react-native";
import Animated from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TAB_BAR_MARGIN } from "@/constants/layout";
import TabItem from "../tab-item";
import { ICustomTabBarProps } from "./custom-tab-bar.interface";
import { customTabBarStyles } from "./custom-tab-bar.styles";
import { TAB_CONFIG } from "./custom-tab-bar.utils";
import useCustomTabBar from "./use-custom-tab-bar";

export default function CustomTabBar(props: ICustomTabBarProps) {
  const { state } = props;
  const insets = useSafeAreaInsets();

  const {
    tabBarWidth,
    pillX,
    tabWidth,
    pillStyle,
    gradientColors,
    onLayout,
    getOnPress,
  } = useCustomTabBar(props);

  return (
    <View
      accessibilityRole="tablist"
      onLayout={onLayout}
      style={[
        customTabBarStyles.container,
        customTabBarStyles.containerPosition(insets.bottom + TAB_BAR_MARGIN),
      ]}
    >
      {tabBarWidth > 0 ? (
        <Animated.View
          style={[customTabBarStyles.viewPill(tabWidth), pillStyle]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={customTabBarStyles.gradient}
          />
        </Animated.View>
      ) : null}

      {state.routes.map((route, index) => {
        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const isFocused = state.index === index;

        return (
          <TabItem
            key={route.key}
            icon={config.icon}
            label={config.label}
            isFocused={isFocused}
            onPress={getOnPress(route.key, route.name)}
            pillX={pillX}
            tabIndex={index}
            tabWidth={tabWidth}
          />
        );
      })}
    </View>
  );
}
