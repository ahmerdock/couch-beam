import { AccessibilityInfo } from "react-native";
import Toast from "react-native-toast-message";

// A toast alone is invisible to screen readers, so every message is announced too.
export const notify = (type: "error" | "success" | "info", message: string) => {
  Toast.show({ type, text1: message });
  AccessibilityInfo.announceForAccessibility(message);
};
