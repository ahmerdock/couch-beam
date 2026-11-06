import { EventEmitter } from "events";
import {
  clearPairing,
  loadPairing,
  parseStoredPairing,
  savePairing,
} from "./certificate-storage";
import { createTvRemoteClient } from "./client";
import { isTvRemoteError } from "./tv-remote.errors";
import type {
  IKeyValueStore,
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
    sendPairingCode = jest.fn((code: string) => this.resolveCode?.(code));
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

describe("certificate storage", () => {
  it("round-trips a saved pairing", () => {
    const store = createMemoryStore();
    savePairing(store, pairing);

    expect(loadPairing(store)).toEqual(pairing);
  });

  it("returns null for a missing entry", () => {
    expect(loadPairing(createMemoryStore())).toBeNull();
  });

  it("returns null for a corrupted entry instead of throwing", () => {
    expect(parseStoredPairing("{not json")).toBeNull();
    expect(parseStoredPairing('{"tv":{"host":"x"}}')).toBeNull();
  });

  it("clears the stored pairing", () => {
    const store = createMemoryStore();
    savePairing(store, pairing);
    clearPairing(store);

    expect(loadPairing(store)).toBeNull();
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

describe("tv remote store", () => {
  it("starts unpaired with no stored pairing", () => {
    const { library } = createFakeLibrary("ready");
    const store = createTvRemoteStore(
      createMemoryStore(),
      createTvRemoteClient(library),
    );

    expect(store.getState()).toEqual({ status: "unpaired", tv: null });
  });

  it("auto-connects from a stored certificate without a new PIN", async () => {
    const { library } = createFakeLibrary("ready");
    const storage = createMemoryStore();
    savePairing(storage, pairing);
    const store = createTvRemoteStore(storage, createTvRemoteClient(library));

    expect(store.getState().status).toBe("disconnected");
    await store.autoConnect();

    expect(store.getState()).toEqual({ status: "connected", tv: pairing.tv });
    expect(store.getSession()).not.toBeNull();
  });

  it("persists a pairing, then forgetting clears it and returns to unpaired", async () => {
    const { library } = createFakeLibrary("ready");
    const storage = createMemoryStore();
    const store = createTvRemoteStore(storage, createTvRemoteClient(library));

    await store.pair(pairing.tv, () => Promise.resolve("1A2B3C"));
    expect(loadPairing(storage)).toEqual(pairing);
    expect(store.getState().status).toBe("connected");

    store.forget();

    expect(loadPairing(storage)).toBeNull();
    expect(store.getState()).toEqual({ status: "unpaired", tv: null });
    expect(store.getSession()).toBeNull();
  });

  it("falls back to disconnected when the TV is unreachable", async () => {
    const { library } = createFakeLibrary("unreachable");
    const storage = createMemoryStore();
    savePairing(storage, pairing);
    const store = createTvRemoteStore(storage, createTvRemoteClient(library));

    await store.autoConnect();

    expect(store.getState().status).toBe("disconnected");
  });
});
