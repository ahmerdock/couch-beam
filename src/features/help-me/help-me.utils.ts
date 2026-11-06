import { ErrorCode } from "expo-iap";
import { AccessibilityInfo } from "react-native";
import Toast from "react-native-toast-message";
import { HELP_ME_PRODUCT_IDS, HELP_ME_PRODUCTS } from "./help-me.data";

export const HELP_ME_SKUS = Object.values(HELP_ME_PRODUCT_IDS);

const HELP_ME_SKU_SET = new Set<string>(HELP_ME_SKUS);

export const isHelpMeProductId = (productId: string): boolean =>
  HELP_ME_SKU_SET.has(productId);

export const isUserCancelledError = (error: unknown): boolean => {
  if (error && typeof error === "object" && "code" in error) {
    return error.code === ErrorCode.UserCancelled;
  }

  return false;
};

export const isPendingError = (error: unknown): boolean =>
  !!error &&
  typeof error === "object" &&
  "code" in error &&
  error.code === ErrorCode.Pending;

const UNKNOWN_ERROR_MESSAGE = "An unexpected error occurred";

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    if (typeof error.message === "string") {
      return error.message;
    }
  }

  return UNKNOWN_ERROR_MESSAGE;
};

export const showError = (message: string) => {
  Toast.show({ type: "error", text1: message });
  AccessibilityInfo.announceForAccessibility(message);
};

export const showSuccess = (productId: string) => {
  const tier = HELP_ME_PRODUCTS.find((product) => product.id === productId);
  const message = tier?.successMessage ?? "Thank you for your support!";
  Toast.show({ type: "success", text1: message });
  AccessibilityInfo.announceForAccessibility(message);
};

export const showPending = () => {
  const message = "Your payment is pending. It will complete once approved.";
  Toast.show({ type: "info", text1: message });
  AccessibilityInfo.announceForAccessibility(message);
};
