import { useEffect, useState } from "react";
import { LayoutChangeEvent } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useUnistyles } from "react-native-unistyles";
import { ICustomTabBarProps } from "./custom-tab-bar.interface";

export default function useCustomTabBar(props: ICustomTabBarProps) {
  const { state, navigation } = props;

  const { theme } = useUnistyles();
  const [tabBarWidth, setTabBarWidth] = useState(0);

  const tabCount = state.routes.length;
  const tabWidth = tabBarWidth > 0 ? tabBarWidth / tabCount : 0;

  const pillX = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setTabBarWidth(width);
    pillX.value = state.index * (width / tabCount);
  };

  useEffect(() => {
    if (tabWidth > 0) {
      pillX.value = withSpring(state.index * tabWidth, {
        damping: 18,
        stiffness: 180,
        mass: 0.7,
      });
    }
  }, [state.index, tabWidth, pillX]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  const getOnPress = (routeKey: string, routeName: string) => () => {
    const isFocused = state.routes[state.index].key === routeKey;
    const event = navigation.emit({
      type: "tabPress",
      target: routeKey,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName);
    }
  };

  const gradientColors: [string, string] = [
    theme.colors.background,
    theme.colors.primary,
  ];

  return {
    tabBarWidth,
    pillX,
    tabWidth,
    pillStyle,
    gradientColors,
    onLayout,
    getOnPress,
  };
}
