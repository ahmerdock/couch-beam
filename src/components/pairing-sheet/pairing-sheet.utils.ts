import type {
  IPairingSheetState,
  PairingSheetAction,
} from "./pairing-sheet.interface";

export const INITIAL_PAIRING_STATE: IPairingSheetState = {
  step: "scanning",
  tvs: [],
  error: null,
};

export const isValidIpv4 = (text: string) => {
  const parts = text.trim().split(".");

  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^\d{1,3}$/.test(part) && Number(part) >= 0 && Number(part) <= 255,
    )
  );
};

export const PIN_PATTERN = /^[0-9A-F]{6}$/;

export const sanitizePin = (text: string) =>
  text
    .toUpperCase()
    .replace(/[^0-9A-F]/g, "")
    .slice(0, 6);

export const pairingSheetReducer = (
  state: IPairingSheetState,
  action: PairingSheetAction,
): IPairingSheetState => {
  switch (action.type) {
    case "scan-start":
      return { ...state, step: "scanning", error: null };
    case "scan-done":
      return {
        ...state,
        tvs: action.tvs,
        step: action.tvs.length > 0 ? "pick" : "empty",
      };
    case "manual":
      return { ...state, step: "manual", error: null };
    case "select":
      return { ...state, step: "connecting", error: null };
    case "pin-requested":
      return { ...state, step: "pin" };
    case "pin-submitted":
      return { ...state, step: "connecting" };
    case "failed":
      return {
        ...state,
        step: state.tvs.length > 0 ? "pick" : "empty",
        error: action.message,
      };
  }
};
