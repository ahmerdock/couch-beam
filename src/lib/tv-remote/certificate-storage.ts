import type { IKeyValueStore, IStoredPairing } from "./tv-remote.interface";

export const PAIRING_STORAGE_KEY = "couch_beam_pairing";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export const parseStoredPairing = (
  raw: string | undefined,
): IStoredPairing | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const { tv, certificate } = parsed as Partial<IStoredPairing>;

    if (
      !tv ||
      !certificate ||
      !isNonEmptyString(tv.host) ||
      !isNonEmptyString(tv.name) ||
      !isNonEmptyString(certificate.key) ||
      !isNonEmptyString(certificate.cert)
    ) {
      return null;
    }

    return {
      tv: { host: tv.host, name: tv.name },
      certificate: { key: certificate.key, cert: certificate.cert },
    };
  } catch {
    return null;
  }
};

export const loadPairing = (store: IKeyValueStore): IStoredPairing | null =>
  parseStoredPairing(store.getString(PAIRING_STORAGE_KEY));

export const savePairing = (store: IKeyValueStore, pairing: IStoredPairing) => {
  store.set(PAIRING_STORAGE_KEY, JSON.stringify(pairing));
};

export const clearPairing = (store: IKeyValueStore) => {
  store.remove(PAIRING_STORAGE_KEY);
};
