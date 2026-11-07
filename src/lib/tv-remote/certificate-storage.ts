import type {
  IKeyValueStore,
  IPairingList,
  IStoredPairing,
} from "./tv-remote.interface";

export const LEGACY_PAIRING_STORAGE_KEY = "couch_beam_pairing";
export const PAIRINGS_STORAGE_KEY = "couch_beam_pairings";

const EMPTY_LIST: IPairingList = { activeHost: null, pairings: [] };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

const validatePairing = (parsed: unknown): IStoredPairing | null => {
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
};

export const parseStoredPairing = (
  raw: string | undefined,
): IStoredPairing | null => {
  if (!raw) {
    return null;
  }

  try {
    return validatePairing(JSON.parse(raw));
  } catch {
    return null;
  }
};

const parsePairingList = (raw: string): IPairingList => {
  try {
    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return EMPTY_LIST;
    }

    const { activeHost, pairings } = parsed as Partial<IPairingList>;
    const valid = (Array.isArray(pairings) ? pairings : []).flatMap((item) => {
      const pairing = validatePairing(item);
      return pairing ? [pairing] : [];
    });
    const active = valid.some((pairing) => pairing.tv.host === activeHost)
      ? activeHost
      : (valid[0]?.tv.host ?? null);

    return { activeHost: active ?? null, pairings: valid };
  } catch {
    return EMPTY_LIST;
  }
};

export const loadPairingList = (store: IKeyValueStore): IPairingList => {
  const raw = store.getString(PAIRINGS_STORAGE_KEY);

  if (raw !== undefined) {
    return parsePairingList(raw);
  }

  const legacy = parseStoredPairing(
    store.getString(LEGACY_PAIRING_STORAGE_KEY),
  );

  if (!legacy) {
    return EMPTY_LIST;
  }

  const migrated = addPairing(EMPTY_LIST, legacy);
  savePairingList(store, migrated);
  store.remove(LEGACY_PAIRING_STORAGE_KEY);

  return migrated;
};

export const savePairingList = (store: IKeyValueStore, list: IPairingList) => {
  store.set(PAIRINGS_STORAGE_KEY, JSON.stringify(list));
};

export const getActivePairing = (list: IPairingList): IStoredPairing | null =>
  list.pairings.find((pairing) => pairing.tv.host === list.activeHost) ?? null;

// A TV's host is its identity: adding a saved host replaces its entry.
export const addPairing = (
  list: IPairingList,
  pairing: IStoredPairing,
): IPairingList => ({
  activeHost: pairing.tv.host,
  pairings: [
    ...list.pairings.filter((item) => item.tv.host !== pairing.tv.host),
    pairing,
  ],
});

export const setActiveHost = (
  list: IPairingList,
  host: string,
): IPairingList =>
  list.pairings.some((pairing) => pairing.tv.host === host)
    ? { ...list, activeHost: host }
    : list;

export const removePairing = (
  list: IPairingList,
  host: string,
): IPairingList => {
  const pairings = list.pairings.filter((pairing) => pairing.tv.host !== host);

  return {
    activeHost:
      list.activeHost === host
        ? (pairings[0]?.tv.host ?? null)
        : list.activeHost,
    pairings,
  };
};
