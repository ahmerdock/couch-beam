import {
  addPairing,
  getActivePairing,
  LEGACY_PAIRING_STORAGE_KEY,
  loadPairingList,
  parseStoredPairing,
  PAIRINGS_STORAGE_KEY,
  removePairing,
  savePairingList,
} from "./certificate-storage";
import type { IStoredPairing } from "./tv-remote.interface";
import {
  box,
  createMemoryStore,
  emptyList,
  mainTv,
  pairing,
} from "./test-utils";

describe("saved TV list storage", () => {
  it("round-trips a saved list", () => {
    const store = createMemoryStore();
    const list = addPairing(addPairing(emptyList, mainTv), box);
    savePairingList(store, list);

    expect(loadPairingList(store)).toEqual(list);
  });

  it("migrates the old single pairing into a one-item active list", () => {
    const store = createMemoryStore();
    store.set(LEGACY_PAIRING_STORAGE_KEY, JSON.stringify(pairing));

    const list = loadPairingList(store);

    expect(list.pairings).toEqual([pairing]);
    expect(list.activeHost).toBe(pairing.tv.host);
    expect(store.data.has(LEGACY_PAIRING_STORAGE_KEY)).toBe(false);
    expect(store.data.has(PAIRINGS_STORAGE_KEY)).toBe(true);
  });

  it("returns an empty list when nothing is stored", () => {
    expect(loadPairingList(createMemoryStore())).toEqual(emptyList);
  });

  it("returns an empty list for a corrupted value instead of throwing", () => {
    const store = createMemoryStore();
    store.set(PAIRINGS_STORAGE_KEY, "{not json");

    expect(loadPairingList(store)).toEqual(emptyList);
    expect(parseStoredPairing('{"tv":{"host":"x"}}')).toBeNull();
  });

  it("drops an entry with no certificate and keeps the rest", () => {
    const store = createMemoryStore();
    store.set(
      PAIRINGS_STORAGE_KEY,
      JSON.stringify({
        activeHost: box.tv.host,
        pairings: [mainTv, { tv: box.tv }],
      }),
    );

    const list = loadPairingList(store);

    expect(list.pairings).toEqual([mainTv]);
    expect(list.activeHost).toBe(mainTv.tv.host);
  });

  it("adds a TV with a new host and makes it active", () => {
    const list = addPairing(addPairing(emptyList, mainTv), box);

    expect(list.pairings).toHaveLength(2);
    expect(list.activeHost).toBe(box.tv.host);
  });

  it("replaces the entry for an already saved host", () => {
    const refreshed = { ...mainTv, certificate: { key: "NEW", cert: "NEW" } };
    const list = addPairing(addPairing(emptyList, mainTv), refreshed);

    expect(list.pairings).toEqual([refreshed]);
  });

  it("moves to the first remaining TV when the active one is removed", () => {
    const third: IStoredPairing = {
      tv: { name: "Bedroom", host: "192.168.1.30" },
      certificate: { key: "K", cert: "C" },
    };
    const list = [mainTv, box, third].reduce(addPairing, emptyList);

    const next = removePairing(list, third.tv.host);

    expect(next.pairings.map((p) => p.tv.host)).toEqual([
      mainTv.tv.host,
      box.tv.host,
    ]);
    expect(next.activeHost).toBe(mainTv.tv.host);
  });

  it("keeps the active TV when a different one is removed", () => {
    const list = addPairing(addPairing(emptyList, mainTv), box);

    expect(removePairing(list, mainTv.tv.host).activeHost).toBe(box.tv.host);
  });

  it("empties the list when the last TV is removed", () => {
    const list = addPairing(emptyList, mainTv);

    expect(removePairing(list, mainTv.tv.host)).toEqual(emptyList);
    expect(getActivePairing(emptyList)).toBeNull();
  });
});
