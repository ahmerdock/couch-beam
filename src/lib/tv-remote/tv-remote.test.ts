import { EventEmitter } from "events";
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
import { createTvRemoteClient } from "./client";
import { isTvRemoteError, TvRemoteError } from "./tv-remote.errors";
import type {
  IKeyValueStore,
  ITvSession,
  IRemoteLibrary,
  IRemoteLibraryInstance,
  IStoredPairing,
} from "./tv-remote.interface";
import { createTvRemoteStore } from "./tv-remote.store";
import { diffTextEdit, splitTextEdit } from "./text-keys";

const pairing: IStoredPairing = {
  tv: { name: "Living Room TV", host: "192.168.1.20" },
  certificate: { key: "KEY", cert: "CERT" },
};

const createMemoryStore = (): IKeyValueStore & {
  data: Map<string, string>;
} => {
  const data = new Map<string, string>();
  return {
    data,
    getString: (key) => data.get(key),
    set: (key, value) => void data.set(key, value),
    remove: (key) => data.delete(key),
  };
};

type FakeBehavior = "ready" | "bad-pin" | "unreachable";

const createFakeLibrary = (behavior: FakeBehavior) => {
  const sentKeys: number[] = [];
  const instances: FakeRemote[] = [];

  class FakeRemote extends EventEmitter implements IRemoteLibraryInstance {
    sendKey = jest.fn((key: number) => void sentKeys.push(key));
    sendPower = jest.fn();
    sendAppLink = jest.fn();
    sendText = jest.fn();
    sendPairingCode = jest.fn((code: string) => {
      // Like the real library: a wrong code resolves false and leaves start()
      // pending, with no error event.
      if (behavior === "bad-pin") {
        return Promise.resolve(false);
      }

      this.resolveCode?.(code);

      return Promise.resolve(true);
    });
    stop = jest.fn(() => this.resolveCode?.(null));
    hasCertificate: boolean;
    resolveCode: ((code: string | null) => void) | null = null;

    constructor(hasCertificate: boolean) {
      super();
      this.hasCertificate = hasCertificate;
    }

    getCertificate() {
      return { key: "KEY", cert: "CERT" };
    }

    async start() {
      if (behavior === "unreachable") {
        throw new Error("ECONNREFUSED");
      }

      if (!this.hasCertificate) {
        const code = new Promise<string | null>((resolve) => {
          this.resolveCode = resolve;
        });
        this.emit("secret");

        if ((await code) === null || behavior === "bad-pin") {
          return false;
        }
      }

      this.emit("ready");
      return true;
    }
  }

  const library: IRemoteLibrary = {
    create: (_host, certificate) => {
      const remote = new FakeRemote(certificate !== null);
      instances.push(remote);
      return remote;
    },
    keyCodes: { KEYCODE_DPAD_LEFT: 21, KEYCODE_A: 29, KEYCODE_DEL: 67 },
    shortPress: 3,
  };

  return { library, sentKeys, instances };
};

const mainTv: IStoredPairing = {
  tv: { name: "Living Room TV", host: "192.168.1.20" },
  certificate: { key: "KEY-A", cert: "CERT-A" },
};
const box: IStoredPairing = {
  tv: { name: "CANDY Android TV DVB2K", host: "192.168.1.12" },
  certificate: { key: "KEY-B", cert: "CERT-B" },
};
const emptyList = { activeHost: null, pairings: [] };

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

describe("text edits", () => {
  it("merges typed characters and backspaces into segments", () => {
    expect(splitTextEdit("ab\b\bc")).toEqual([
      { kind: "insert", text: "ab" },
      { kind: "delete", text: "\b\b" },
      { kind: "insert", text: "c" },
    ]);
  });

  it("diffs an edit into deletions and an insertion", () => {
    expect(diffTextEdit("abc", "abd")).toEqual({ deleteCount: 1, insert: "d" });
  });
});

describe("tv remote client", () => {
  it("reconnects with a stored certificate and no PIN request", async () => {
    const { library } = createFakeLibrary("ready");
    const client = createTvRemoteClient(library);
    const requestPin = jest.fn();

    const session = await client.connect(pairing);

    expect(session).toBeDefined();
    expect(requestPin).not.toHaveBeenCalled();
  });

  it("pairs with a PIN and returns a certificate to persist", async () => {
    const { library, instances } = createFakeLibrary("ready");
    const client = createTvRemoteClient(library);
    const requestPin = jest.fn().mockResolvedValue("1A2B3C");

    const result = await client.pair(pairing.tv, requestPin);

    expect(requestPin).toHaveBeenCalledTimes(1);
    expect(instances[0].sendPairingCode).toHaveBeenCalledWith("1A2B3C");
    expect(result.pairing).toEqual(pairing);
  });

  it("surfaces a typed pairing error when the code is rejected", async () => {
    const { library } = createFakeLibrary("bad-pin");
    const client = createTvRemoteClient(library);

    const error = await client
      .pair(pairing.tv, () => Promise.resolve("000000"))
      .catch((e: unknown) => e);

    expect(isTvRemoteError(error, "pairing")).toBe(true);
  });

  it("surfaces a connection error, distinct from a pairing error, when the TV is unreachable", async () => {
    const { library } = createFakeLibrary("unreachable");
    const client = createTvRemoteClient(library);

    const error = await client.connect(pairing).catch((e: unknown) => e);

    expect(isTvRemoteError(error, "connection")).toBe(true);
    expect(isTvRemoteError(error, "pairing")).toBe(false);
  });

  it("rejects with a pairing error when the user cancels at the PIN step", async () => {
    const { library } = createFakeLibrary("ready");
    const client = createTvRemoteClient(library);

    const error = await client
      .pair(pairing.tv, () => Promise.reject(new Error("closed")))
      .catch((e: unknown) => e);

    expect(isTvRemoteError(error, "pairing")).toBe(true);
  });

  it("sends directions as key codes and text through the library's text call", async () => {
    const { library, sentKeys, instances } = createFakeLibrary("ready");
    const session = await createTvRemoteClient(library).connect(pairing);

    session.sendDirection("left");
    session.sendText("hi\b");

    expect(instances[0].sendText).toHaveBeenCalledWith("hi");
    expect(sentKeys).toEqual([21, 67]);
  });
});

const createDeferredLibrary = () => {
  const pending: { host: string; resolve: () => void }[] = [];
  const sessions: Record<string, { close: jest.Mock }> = {};

  const client = {
    pair: jest.fn(),
    connect: jest.fn(
      (target: IStoredPairing) =>
        new Promise<ITvSession>((resolve) => {
          const session = {
            sendDirection: jest.fn(),
            sendVolume: jest.fn(),
            sendPower: jest.fn(),
            sendText: jest.fn(),
            launchApp: jest.fn(),
            close: jest.fn(),
          };
          sessions[target.tv.host] = session;
          pending.push({
            host: target.tv.host,
            resolve: () => resolve(session),
          });
        }),
    ),
  };

  return { client, pending, sessions };
};

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
