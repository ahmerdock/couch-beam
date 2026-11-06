import { StyleSheet } from "react-native-unistyles";

export const shortHeadingStyles = StyleSheet.create((theme) => ({
  heading: {
    fontFamily: theme.typography.heading.regular,
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.gap(2),
    letterSpacing: 0.8,
  },
}));
