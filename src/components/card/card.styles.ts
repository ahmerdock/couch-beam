import { StyleSheet } from "react-native-unistyles";

export const cardStyles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: theme.gap(2),
  },
}));
