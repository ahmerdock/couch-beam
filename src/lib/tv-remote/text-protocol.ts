// The TV types text through an IME batch edit (RemoteMessage field 21), which
// react-native-androidtv-remote cannot build: its protobuf schema has no text
// field. This is the minimal encoder for that one message, plus a reader for
// the counters the TV attaches to its own batch edits.
import { Buffer } from "buffer";

const IME_BATCH_EDIT_FIELD = 21;

const varint = (value: number): number[] => {
  const bytes: number[] = [];
  let rest = value;

  while (rest > 0x7f) {
    bytes.push((rest & 0x7f) | 0x80);
    rest = Math.floor(rest / 128);
  }

  bytes.push(rest);
  return bytes;
};

const tag = (field: number, wireType: number) =>
  varint((field << 3) | wireType);

const lengthDelimited = (field: number, payload: number[]) => [
  ...tag(field, 2),
  ...varint(payload.length),
  ...payload,
];

export const encodeImeTextMessage = (
  imeCounter: number,
  fieldCounter: number,
  text: string,
): Buffer => {
  const position = text.length - 1;
  const textBytes = Array.from(Buffer.from(text, "utf8"));

  const imeObject = [
    ...tag(1, 0),
    ...varint(position),
    ...tag(2, 0),
    ...varint(position),
    ...lengthDelimited(3, textBytes),
  ];
  const editInfo = [
    ...tag(1, 0),
    ...varint(1),
    ...lengthDelimited(2, imeObject),
  ];
  const batchEdit = [
    ...tag(1, 0),
    ...varint(imeCounter),
    ...tag(2, 0),
    ...varint(fieldCounter),
    ...lengthDelimited(3, editInfo),
  ];
  const message = lengthDelimited(IME_BATCH_EDIT_FIELD, batchEdit);

  return Buffer.from([...varint(message.length), ...message]);
};

const readVarint = (bytes: Uint8Array, start: number) => {
  let value = 0;
  let multiplier = 1;
  let offset = start;

  while (offset < bytes.length) {
    const byte = bytes[offset];
    value += (byte & 0x7f) * multiplier;
    offset += 1;

    if ((byte & 0x80) === 0) {
      return { value, next: offset };
    }

    multiplier *= 128;
  }

  return null;
};

export interface IImeCounters {
  imeCounter: number;
  fieldCounter: number;
}

// Reads one length-delimited RemoteMessage and returns the counters when it is
// an IME batch edit. Anything else, or anything malformed, returns null.
export const readImeCounters = (frame: Uint8Array): IImeCounters | null => {
  const length = readVarint(frame, 0);

  if (!length || length.next + length.value > frame.length) {
    return null;
  }

  let offset = length.next;
  const end = length.next + length.value;

  while (offset < end) {
    const header = readVarint(frame, offset);

    if (!header) {
      return null;
    }

    const field = Math.floor(header.value / 8);
    const wireType = header.value % 8;
    offset = header.next;

    if (wireType === 0) {
      const skipped = readVarint(frame, offset);
      if (!skipped) return null;
      offset = skipped.next;
    } else if (wireType === 2) {
      const size = readVarint(frame, offset);
      if (!size) return null;

      if (field === IME_BATCH_EDIT_FIELD) {
        return readBatchEditCounters(
          frame.subarray(size.next, size.next + size.value),
        );
      }

      offset = size.next + size.value;
    } else {
      return null;
    }
  }

  return null;
};

const readBatchEditCounters = (payload: Uint8Array): IImeCounters => {
  const counters: IImeCounters = { imeCounter: 0, fieldCounter: 0 };
  let offset = 0;

  while (offset < payload.length) {
    const header = readVarint(payload, offset);
    if (!header) break;

    const field = Math.floor(header.value / 8);
    const wireType = header.value % 8;
    offset = header.next;

    if (wireType === 0) {
      const value = readVarint(payload, offset);
      if (!value) break;
      offset = value.next;

      if (field === 1) counters.imeCounter = value.value;
      if (field === 2) counters.fieldCounter = value.value;
    } else if (wireType === 2) {
      const size = readVarint(payload, offset);
      if (!size) break;
      offset = size.next + size.value;
    } else {
      break;
    }
  }

  return counters;
};
