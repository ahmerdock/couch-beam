import { StyleSheet } from "react-native-unistyles";

export const screenTitleStyles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontFamily: theme.typography.heading.regular,
    color: theme.colors.text,
  },
}));
