import type { BottomTabBarProps } from "expo-router/tabs";

export type ICustomTabBarProps = Pick<
  BottomTabBarProps,
  "state" | "navigation"
>;
