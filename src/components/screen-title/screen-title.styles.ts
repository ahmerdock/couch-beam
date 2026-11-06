import { StyleSheet } from "react-native-unistyles";

export const screenTitleStyles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    gap: theme.gap(1),
  },
  title: {
    flexShrink: 1,
    fontSize: 34,
    fontFamily: theme.typography.heading.regular,
    color: theme.colors.text,
  },
}));
