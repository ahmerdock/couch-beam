import { StyleSheet } from "react-native-unistyles";

export const customSwitchStyles = StyleSheet.create((theme) => ({
  track: (value: boolean) => ({
    width: 44,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: "center",
    backgroundColor: value ? theme.colors.primary : theme.colors.text,
  }),
  thumb: (value: boolean) => ({
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: value ? theme.colors.onPrimary : theme.colors.background,
  }),
}));
