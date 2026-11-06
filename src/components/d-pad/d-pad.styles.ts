import { StyleSheet } from "react-native-unistyles";

export const dPadStyles = StyleSheet.create((theme) => ({
  container: {
    alignSelf: "center",
    alignItems: "center",
    gap: theme.gap(1),
    padding: theme.gap(2),
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  row: {
    flexDirection: "row",
    gap: theme.gap(1),
    alignItems: "center",
  },
}));
