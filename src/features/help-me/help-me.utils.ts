import { ErrorCode } from "expo-iap";
import { notify } from "@/utils/notify";
import { HELP_ME_PRODUCT_IDS, HELP_ME_PRODUCTS } from "./help-me.data";

export const HELP_ME_SKUS = Object.values(HELP_ME_PRODUCT_IDS);

const HELP_ME_SKU_SET = new Set<string>(HELP_ME_SKUS);

export const isHelpMeProductId = (productId: string): boolean =>
  HELP_ME_SKU_SET.has(productId);

const hasErrorCode = (error: unknown, code: ErrorCode): boolean =>
  !!error &&
  typeof error === "object" &&
  "code" in error &&
  error.code === code;

export const isUserCancelledError = (error: unknown): boolean =>
  hasErrorCode(error, ErrorCode.UserCancelled);

export const isPendingError = (error: unknown): boolean =>
  hasErrorCode(error, ErrorCode.Pending);

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
  notify("error", message);
};

export const showSuccess = (productId: string) => {
  const tier = HELP_ME_PRODUCTS.find((product) => product.id === productId);
  const message = tier?.successMessage ?? "Thank you for your support!";
  notify("success", message);
};

export const showPending = () => {
  const message = "Your payment is pending. It will complete once approved.";
  notify("info", message);
};
