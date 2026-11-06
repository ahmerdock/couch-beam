import { StyleSheet } from "react-native-unistyles";

export const remoteStyles = StyleSheet.create((theme) => ({
  banner: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    padding: theme.gap(2),
    marginBottom: theme.gap(2),
    gap: theme.gap(1),
  },
  bannerText: {
    fontSize: 14,
    fontFamily: theme.typography.body.medium,
    color: theme.colors.text,
  },
  bannerButton: {
    alignSelf: "flex-start",
    paddingVertical: theme.gap(1),
    paddingHorizontal: theme.gap(2),
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  bannerButtonText: {
    fontSize: 14,
    fontFamily: theme.typography.body.bold,
    color: theme.colors.onPrimary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.gap(2),
  },
  input: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: theme.gap(2),
    paddingVertical: theme.gap(1.5),
    fontSize: 16,
    fontFamily: theme.typography.body.regular,
    color: theme.colors.text,
    marginBottom: theme.gap(2),
  },
  section: {
    marginTop: theme.gap(2),
  },
}));
