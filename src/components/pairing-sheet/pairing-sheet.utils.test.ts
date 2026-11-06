import {
  INITIAL_PAIRING_STATE,
  isValidIpv4,
  pairingSheetReducer,
  sanitizePin,
} from "./pairing-sheet.utils";

const tv = { name: "Living Room TV", host: "192.168.1.20" };

describe("pairingSheetReducer", () => {
  it("shows the picker when a scan finds TVs", () => {
    const next = pairingSheetReducer(INITIAL_PAIRING_STATE, {
      type: "scan-done",
      tvs: [tv],
    });

    expect(next.step).toBe("pick");
    expect(next.tvs).toEqual([tv]);
  });

  it("shows the empty state when a scan finds nothing", () => {
    const next = pairingSheetReducer(INITIAL_PAIRING_STATE, {
      type: "scan-done",
      tvs: [],
    });

    expect(next.step).toBe("empty");
  });

  it("walks select -> pin -> connecting", () => {
    let state = pairingSheetReducer(INITIAL_PAIRING_STATE, {
      type: "scan-done",
      tvs: [tv],
    });
    state = pairingSheetReducer(state, { type: "select" });
    expect(state.step).toBe("connecting");
    state = pairingSheetReducer(state, { type: "pin-requested" });
    expect(state.step).toBe("pin");
    state = pairingSheetReducer(state, { type: "pin-submitted" });
    expect(state.step).toBe("connecting");
  });

  it("returns to the picker with an inline error when pairing fails", () => {
    let state = pairingSheetReducer(INITIAL_PAIRING_STATE, {
      type: "scan-done",
      tvs: [tv],
    });
    state = pairingSheetReducer(state, { type: "select" });
    state = pairingSheetReducer(state, { type: "failed", message: "Bad code" });

    expect(state.step).toBe("pick");
    expect(state.error).toBe("Bad code");
  });

  it("clears the error when a new scan starts", () => {
    const failed = pairingSheetReducer(INITIAL_PAIRING_STATE, {
      type: "failed",
      message: "Bad code",
    });

    expect(
      pairingSheetReducer(failed, { type: "scan-start" }).error,
    ).toBeNull();
  });
});

describe("sanitizePin", () => {
  it("uppercases and keeps only six hex characters", () => {
    expect(sanitizePin("ab12-cdz9")).toBe("AB12CD");
  });
});

describe("manual entry", () => {
  it("moves to the manual step and clears any error", () => {
    const failed = pairingSheetReducer(INITIAL_PAIRING_STATE, {
      type: "failed",
      message: "Bad code",
    });

    const next = pairingSheetReducer(failed, { type: "manual" });

    expect(next.step).toBe("manual");
    expect(next.error).toBeNull();
  });

  it("returns to the picker with an error when pairing by address fails", () => {
    let state = pairingSheetReducer(INITIAL_PAIRING_STATE, { type: "manual" });
    state = pairingSheetReducer(state, { type: "select" });
    state = pairingSheetReducer(state, { type: "failed", message: "No answer" });

    expect(state.step).toBe("empty");
    expect(state.error).toBe("No answer");
  });
});

describe("isValidIpv4", () => {
  it("accepts a normal address and trims spaces", () => {
    expect(isValidIpv4(" 192.168.1.12 ")).toBe(true);
  });

  it("rejects too few parts, out-of-range parts, and non-numbers", () => {
    expect(isValidIpv4("192.168.1")).toBe(false);
    expect(isValidIpv4("192.168.1.256")).toBe(false);
    expect(isValidIpv4("192.168.one.1")).toBe(false);
    expect(isValidIpv4("")).toBe(false);
  });
});
