import { StyleSheet } from "react-native-unistyles";

export const touchpadStyles = StyleSheet.create((theme) => ({
  pad: {
    height: 260,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    gap: theme.gap(1),
    paddingHorizontal: theme.gap(2),
  },
  disabled: {
    opacity: 0.5,
  },
  hint: {
    fontSize: 14,
    fontFamily: theme.typography.body.medium,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
}));
