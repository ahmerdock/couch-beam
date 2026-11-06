import { StyleSheet } from "react-native-unistyles";

export const pairingSheetStyles = StyleSheet.create((theme) => ({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: theme.gap(3),
    paddingBottom: theme.gap(4),
    gap: theme.gap(1.5),
  },
  title: {
    fontFamily: theme.typography.heading.regular,
    fontSize: 24,
    color: theme.colors.text,
  },
  body: {
    fontSize: 14,
    fontFamily: theme.typography.body.regular,
    color: theme.colors.textSecondary,
  },
  error: {
    fontSize: 14,
    fontFamily: theme.typography.body.medium,
    color: theme.colors.warning,
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
    fontSize: 24,
    letterSpacing: 6,
    textAlign: "center",
    fontFamily: theme.typography.mono.medium,
    color: theme.colors.text,
  },
  tvRow: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: theme.gap(2),
  },
  tvName: {
    fontSize: 16,
    fontFamily: theme.typography.body.bold,
    color: theme.colors.text,
  },
  tvHost: {
    fontSize: 14,
    fontFamily: theme.typography.mono.regular,
    color: theme.colors.textSecondary,
  },
  button: (variant: "primary" | "secondary", disabled: boolean) => ({
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.gap(1.5),
    borderRadius: 12,
    backgroundColor:
      variant === "primary"
        ? theme.colors.primary
        : theme.colors.backgroundSecondary,
    opacity: disabled ? 0.5 : 1,
  }),
  buttonText: (variant: "primary" | "secondary") => ({
    fontSize: 16,
    fontFamily: theme.typography.body.bold,
    color: variant === "primary" ? theme.colors.onPrimary : theme.colors.text,
  }),
}));
