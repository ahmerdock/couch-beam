import { clearPairing, loadPairing, savePairing } from "./certificate-storage";
import { createTvRemoteClient } from "./client";
import { isTvRemoteError } from "./tv-remote.errors";
import type {
  IDiscoveredTv,
  IKeyValueStore,
  ITvRemoteClient,
  ITvRemoteState,
  ITvSession,
} from "./tv-remote.interface";

type Listener = () => void;

export interface ITvRemoteStore {
  getState: () => ITvRemoteState;
  getSession: () => ITvSession | null;
  subscribe: (listener: Listener) => () => void;
  autoConnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  pair: (tv: IDiscoveredTv, requestPin: () => Promise<string>) => Promise<void>;
  forget: () => void;
}

export const createTvRemoteStore = (
  storage: IKeyValueStore,
  client: ITvRemoteClient,
): ITvRemoteStore => {
  const listeners = new Set<Listener>();
  let session: ITvSession | null = null;
  let state: ITvRemoteState = { status: "unpaired", tv: null };

  const setState = (next: ITvRemoteState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  const closeSession = () => {
    session?.close();
    session = null;
  };

  const initial = loadPairing(storage);
  if (initial) {
    state = { status: "disconnected", tv: initial.tv };
  }

  const reconnect = async () => {
    const pairing = loadPairing(storage);

    if (!pairing) {
      setState({ status: "unpaired", tv: null });
      return;
    }

    closeSession();
    setState({ status: "connecting", tv: pairing.tv });

    try {
      session = await client.connect(pairing);
      setState({ status: "connected", tv: pairing.tv });
    } catch (error) {
      setState({ status: "disconnected", tv: pairing.tv });
      if (!isTvRemoteError(error)) {
        throw error;
      }
    }
  };

  return {
    getState: () => state,
    getSession: () => session,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    autoConnect: async () => {
      if (loadPairing(storage)) {
        await reconnect();
      }
    },
    reconnect,
    pair: async (tv, requestPin) => {
      closeSession();
      const result = await client.pair(tv, requestPin);
      savePairing(storage, result.pairing);
      session = result.session;
      setState({ status: "connected", tv: result.pairing.tv });
    },
    forget: () => {
      closeSession();
      clearPairing(storage);
      setState({ status: "unpaired", tv: null });
    },
  };
};

let singleton: ITvRemoteStore | null = null;

export const getTvRemoteStore = (): ITvRemoteStore => {
  if (!singleton) {
    // Required lazily so tests of the store factory never load native MMKV or the TLS library.
    /* eslint-disable @typescript-eslint/no-require-imports */
    const { mmkvStorage } = require("@/theme/unistyles");
    const { remoteLibrary } = require("./remote-library");
    /* eslint-enable @typescript-eslint/no-require-imports */
    singleton = createTvRemoteStore(
      mmkvStorage,
      createTvRemoteClient(remoteLibrary),
    );
  }

  return singleton;
};
