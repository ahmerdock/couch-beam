import { EventEmitter } from "events";
import type {
  IKeyValueStore,
  IRemoteLibrary,
  IRemoteLibraryInstance,
  IStoredPairing,
  ITvSession,
} from "./tv-remote.interface";

export const pairing: IStoredPairing = {
  tv: { name: "Living Room TV", host: "192.168.1.20" },
  certificate: { key: "KEY", cert: "CERT" },
};

export const createMemoryStore = (): IKeyValueStore & {
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

export type FakeBehavior =
  | "ready"
  | "bad-pin"
  | "unreachable"
  | "refused"
  | "no-certificate";

export const createFakeLibrary = (behavior: FakeBehavior) => {
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
      return behavior === "no-certificate" ? {} : { key: "KEY", cert: "CERT" };
    }

    async start() {
      if (behavior === "unreachable") {
        throw new Error("ECONNREFUSED");
      }

      if (behavior === "refused") {
        return false;
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

export const mainTv: IStoredPairing = {
  tv: { name: "Living Room TV", host: "192.168.1.20" },
  certificate: { key: "KEY-A", cert: "CERT-A" },
};
export const box: IStoredPairing = {
  tv: { name: "CANDY Android TV DVB2K", host: "192.168.1.12" },
  certificate: { key: "KEY-B", cert: "CERT-B" },
};
export const emptyList = { activeHost: null, pairings: [] };

export const createDeferredLibrary = () => {
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
