import {
  addPairing,
  LEGACY_PAIRING_STORAGE_KEY,
  loadPairingList,
  savePairingList,
} from "./certificate-storage";
import { createTvRemoteClient } from "./client";
import { TvRemoteError } from "./tv-remote.errors";
import type { IStoredPairing, ITvSession } from "./tv-remote.interface";
import { createTvRemoteStore } from "./tv-remote.store";
import {
  box,
  createDeferredLibrary,
  createFakeLibrary,
  createMemoryStore,
  emptyList,
  mainTv,
  pairing,
} from "./test-utils";
import type { FakeBehavior } from "./test-utils";

const createStoreWith = (
  list: IStoredPairing[],
  library = "ready" as FakeBehavior,
) => {
  const storage = createMemoryStore();
  savePairingList(storage, list.reduce(addPairing, emptyList));
  const { library: fake } = createFakeLibrary(library);
  return {
    storage,
    store: createTvRemoteStore(storage, createTvRemoteClient(fake)),
  };
};

describe("tv remote store", () => {
  it("starts unpaired with no saved TV", () => {
    const { library } = createFakeLibrary("ready");
    const store = createTvRemoteStore(
      createMemoryStore(),
      createTvRemoteClient(library),
    );

    expect(store.getState()).toEqual({ status: "unpaired", tv: null, tvs: [] });
  });

  it("auto-connects the active saved TV without a new PIN", async () => {
    const { store } = createStoreWith([mainTv, box]);

    expect(store.getState().status).toBe("disconnected");
    await store.autoConnect();

    expect(store.getState().status).toBe("connected");
    expect(store.getState().tv).toEqual(box.tv);
    expect(store.getState().tvs).toEqual([mainTv.tv, box.tv]);
    expect(store.getSession()).not.toBeNull();
  });

  it("carries a legacy single pairing in as the active TV", async () => {
    const storage = createMemoryStore();
    storage.set(LEGACY_PAIRING_STORAGE_KEY, JSON.stringify(pairing));
    const { library } = createFakeLibrary("ready");
    const store = createTvRemoteStore(storage, createTvRemoteClient(library));

    await store.autoConnect();

    expect(store.getState()).toEqual({
      status: "connected",
      tv: pairing.tv,
      tvs: [pairing.tv],
    });
  });

  it("switching closes the first session and connects the second", async () => {
    const { store } = createStoreWith([mainTv, box]);
    await store.autoConnect();
    const first = store.getSession();
    const close = jest.spyOn(first as ITvSession, "close");

    await store.switchTo(mainTv.tv.host);

    expect(close).toHaveBeenCalled();
    expect(store.getState().tv).toEqual(mainTv.tv);
    expect(store.getState().status).toBe("connected");
    expect(store.getSession()).not.toBe(first);
  });

  it("keeps a TV that cannot be reached active and saved", async () => {
    const { store } = createStoreWith([mainTv, box], "unreachable");

    await store.switchTo(mainTv.tv.host);

    expect(store.getState().status).toBe("disconnected");
    expect(store.getState().tv).toEqual(mainTv.tv);
    expect(store.getState().tvs).toHaveLength(2);
  });

  it("discards a slow connect that resolves after switching away", async () => {
    const { client, pending, sessions } = createDeferredLibrary();
    const storage = createMemoryStore();
    savePairingList(storage, [mainTv, box].reduce(addPairing, emptyList));
    const store = createTvRemoteStore(storage, client);

    const connectingBox = store.autoConnect();
    const connectingMain = store.switchTo(mainTv.tv.host);
    pending.find((p) => p.host === mainTv.tv.host)?.resolve();
    await connectingMain;
    pending.find((p) => p.host === box.tv.host)?.resolve();
    await connectingBox;

    expect(store.getState().tv).toEqual(mainTv.tv);
    expect(store.getState().status).toBe("connected");
    expect(store.getSession()).toBe(sessions[mainTv.tv.host]);
    expect(sessions[box.tv.host].close).toHaveBeenCalled();
  });

  it("pairing a second TV keeps the first saved and makes the new one active", async () => {
    const { store, storage } = createStoreWith([mainTv]);
    await store.autoConnect();
    const { library } = createFakeLibrary("ready");
    const second = createTvRemoteStore(storage, createTvRemoteClient(library));

    await second.pair(box.tv, () => Promise.resolve("1A2B3C"));

    expect(second.getState().tv).toEqual(box.tv);
    expect(second.getState().tvs).toEqual([mainTv.tv, box.tv]);
    expect(loadPairingList(storage).pairings).toHaveLength(2);
  });

  it("a failed pairing for a second TV leaves the first connected", async () => {
    const { library } = createFakeLibrary("ready");
    const client = {
      ...createTvRemoteClient(library),
      pair: jest
        .fn()
        .mockRejectedValue(new TvRemoteError("pairing", "Bad Code")),
    };
    const storage = createMemoryStore();
    savePairingList(storage, addPairing(emptyList, mainTv));
    const store = createTvRemoteStore(storage, client);
    await store.autoConnect();
    const session = store.getSession();

    await expect(
      store.pair(box.tv, () => Promise.resolve("000000")),
    ).rejects.toBeInstanceOf(TvRemoteError);

    expect(store.getSession()).toBe(session);
    expect(store.getState()).toEqual({
      status: "connected",
      tv: mainTv.tv,
      tvs: [mainTv.tv],
    });
  });

  it("forgetting the active TV connects the remaining one", async () => {
    const { store, storage } = createStoreWith([mainTv, box]);
    await store.autoConnect();

    await store.forget(box.tv.host);

    expect(store.getState().tv).toEqual(mainTv.tv);
    expect(store.getState().status).toBe("connected");
    expect(store.getState().tvs).toEqual([mainTv.tv]);
    expect(loadPairingList(storage).pairings).toHaveLength(1);
  });

  it("forgetting the only TV returns to unpaired with no session", async () => {
    const { store } = createStoreWith([mainTv]);
    await store.autoConnect();

    await store.forget(mainTv.tv.host);

    expect(store.getState()).toEqual({ status: "unpaired", tv: null, tvs: [] });
    expect(store.getSession()).toBeNull();
  });

  it("forgetting an inactive TV leaves the active connection alone", async () => {
    const { store } = createStoreWith([mainTv, box]);
    await store.autoConnect();
    const session = store.getSession();

    await store.forget(mainTv.tv.host);

    expect(store.getSession()).toBe(session);
    expect(store.getState().tv).toEqual(box.tv);
    expect(store.getState().tvs).toEqual([box.tv]);
  });

  it("falls back to disconnected when the active TV is unreachable", async () => {
    const { store } = createStoreWith([mainTv], "unreachable");

    await store.autoConnect();

    expect(store.getState().status).toBe("disconnected");
  });
});
