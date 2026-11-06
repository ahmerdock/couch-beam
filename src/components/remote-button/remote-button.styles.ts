import { StyleSheet } from "react-native-unistyles";

export const remoteButtonStyles = StyleSheet.create((theme) => ({
  button: (variant: "default" | "primary", disabled: boolean) => ({
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      variant === "primary"
        ? theme.colors.primary
        : theme.colors.backgroundSecondary,
    opacity: disabled ? 0.4 : 1,
  }),
}));
