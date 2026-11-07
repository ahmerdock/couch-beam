import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { createMMKV, deleteMMKV } from "react-native-mmkv";
import { mmkvStorage } from "@/theme/unistyles";
import { migratePairings } from "./certificate-storage";
import type { IKeyValueStore } from "./tv-remote.interface";

const STORAGE_ID = "couch_beam_pairings_secure";
const ENCRYPTION_KEY_NAME = "couch_beam_pairings_key";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

// The pairing list is too big for a SecureStore value (iOS caps them at about
// 2 KB), so SecureStore holds only the key to an encrypted MMKV file.
const getEncryptionKey = (): string => {
  const existing = SecureStore.getItem(ENCRYPTION_KEY_NAME);

  if (existing) {
    return existing;
  }

  // Without the key an earlier encrypted file can never be read again.
  deleteMMKV(STORAGE_ID);
  const key = toHex(Crypto.getRandomBytes(16));
  SecureStore.setItem(ENCRYPTION_KEY_NAME, key);

  return key;
};

export const createSecurePairingStorage = (): IKeyValueStore => {
  const secure = createMMKV({
    id: STORAGE_ID,
    encryptionKey: getEncryptionKey(),
    encryptionType: "AES-256",
  });

  migratePairings(mmkvStorage, secure);

  return secure;
};
