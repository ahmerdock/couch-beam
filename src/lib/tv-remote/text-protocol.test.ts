import { Buffer } from "buffer";
import { encodeImeTextMessage, readImeCounters } from "./text-protocol";

describe("encodeImeTextMessage", () => {
  it("encodes a framed IME batch edit carrying the text and counters", () => {
    expect(encodeImeTextMessage(3, 7, "hi").toString("hex")).toBe(
      "15aa0112080310071a0c080112080801100" + "11a026869",
    );
  });

  it("round-trips the counters through the reader", () => {
    const bytes = encodeImeTextMessage(300, 7, "x");

    expect(readImeCounters(bytes)).toEqual({
      imeCounter: 300,
      fieldCounter: 7,
    });
  });

  it("encodes non-ASCII text as UTF-8 bytes", () => {
    const bytes = encodeImeTextMessage(1, 1, "é");

    expect(bytes.includes(Buffer.from("é", "utf8")[0])).toBe(true);
  });
});

describe("readImeCounters", () => {
  it("returns null for a frame that is not an IME batch edit", () => {
    // length 2, field 8 (ping request) varint 1
    expect(readImeCounters(Uint8Array.from([2, 8 << 3, 1]))).toBeNull();
  });

  it("returns null for truncated or empty input instead of throwing", () => {
    expect(readImeCounters(Uint8Array.from([]))).toBeNull();
    expect(readImeCounters(Uint8Array.from([50, 0xaa]))).toBeNull();
  });
});
