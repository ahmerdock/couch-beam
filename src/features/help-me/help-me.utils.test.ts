import { ErrorCode } from "expo-iap";
import {
  getErrorMessage,
  HELP_ME_SKUS,
  isHelpMeProductId,
  isPendingError,
  isUserCancelledError,
} from "./help-me.utils";

jest.mock("./help-me.data", () => ({
  HELP_ME_PRODUCT_IDS: { small: "tip_small", large: "tip_large" },
}));

describe("isUserCancelledError", () => {
  it("is true for the user-cancelled code", () => {
    expect(isUserCancelledError({ code: ErrorCode.UserCancelled })).toBe(true);
  });

  it("is false for other codes", () => {
    expect(isUserCancelledError({ code: "other" })).toBe(false);
  });

  it("is false for non-objects and null", () => {
    expect(isUserCancelledError("cancelled")).toBe(false);
    expect(isUserCancelledError(null)).toBe(false);
    expect(isUserCancelledError(undefined)).toBe(false);
  });
});

describe("getErrorMessage", () => {
  it("reads the message of an Error", () => {
    expect(getErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("reads a string message from a plain object", () => {
    expect(getErrorMessage({ message: "plain" })).toBe("plain");
  });

  it("falls back for a non-string message or no error", () => {
    const fallback = "An unexpected error occurred";

    expect(getErrorMessage({ message: 123 })).toBe(fallback);
    expect(getErrorMessage(undefined)).toBe(fallback);
  });
});

describe("isHelpMeProductId", () => {
  it("accepts known SKUs and rejects unknown ones", () => {
    expect(isHelpMeProductId(HELP_ME_SKUS[0])).toBe(true);
    expect(isHelpMeProductId("not-a-sku")).toBe(false);
  });
});

describe("isPendingError", () => {
  it("is true only for the pending code", () => {
    expect(isPendingError({ code: ErrorCode.Pending })).toBe(true);
    expect(isPendingError({ code: ErrorCode.UserCancelled })).toBe(false);
    expect(isPendingError(null)).toBe(false);
  });
});
