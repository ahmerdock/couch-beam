import { StyleSheet } from "react-native-unistyles";

export const homeStyles = StyleSheet.create((theme) => ({
  forgetText: {
    fontSize: 14,
    fontFamily: theme.typography.body.bold,
    color: theme.colors.warning,
  },
}));
