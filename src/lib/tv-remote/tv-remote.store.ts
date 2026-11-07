import {
  addPairing,
  getActivePairing,
  loadPairingList,
  removePairing,
  savePairingList,
  setActiveHost,
} from "./certificate-storage";
import { createTvRemoteClient } from "./client";
import { isTvRemoteError } from "./tv-remote.errors";
import type {
  IDiscoveredTv,
  IKeyValueStore,
  IPairingList,
  ITvRemoteClient,
  ITvRemoteState,
  ITvSession,
  TvConnectionStatus,
} from "./tv-remote.interface";

type Listener = () => void;

export interface ITvRemoteStore {
  getState: () => ITvRemoteState;
  getSession: () => ITvSession | null;
  subscribe: (listener: Listener) => () => void;
  autoConnect: () => Promise<void>;
  reconnect: () => Promise<void>;
  pair: (tv: IDiscoveredTv, requestPin: () => Promise<string>) => Promise<void>;
  switchTo: (host: string) => Promise<void>;
  forget: (host: string) => Promise<void>;
}

const stateFor = (
  list: IPairingList,
  status: TvConnectionStatus,
): ITvRemoteState => {
  const active = getActivePairing(list);

  return {
    status: active ? status : "unpaired",
    tv: active?.tv ?? null,
    tvs: list.pairings.map((pairing) => pairing.tv),
  };
};

export const createTvRemoteStore = (
  storage: IKeyValueStore,
  client: ITvRemoteClient,
): ITvRemoteStore => {
  const listeners = new Set<Listener>();
  let session: ITvSession | null = null;
  // Bumped whenever the active TV or its session may change, so a connect that
  // finishes late knows it is stale and must not replace the live session.
  let generation = 0;

  const initial = loadPairingList(storage);
  let state = stateFor(initial, "disconnected");

  const setState = (next: ITvRemoteState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  const closeSession = () => {
    session?.close();
    session = null;
  };

  // The TV can drop or revoke a live session; without this the store would
  // keep reporting "connected" and every key press would go nowhere.
  const watchSession = (watched: ITvSession, mine: number) => {
    watched.onLost?.(() => {
      if (mine !== generation || session !== watched) {
        return;
      }

      closeSession();
      setState(stateFor(loadPairingList(storage), "disconnected"));
    });
  };

  const connectActive = async () => {
    const list = loadPairingList(storage);
    const pairing = getActivePairing(list);
    const mine = ++generation;

    closeSession();

    if (!pairing) {
      setState(stateFor(list, "unpaired"));
      return;
    }

    setState(stateFor(list, "connecting"));

    try {
      const next = await client.connect(pairing);

      if (mine !== generation) {
        next.close();
        return;
      }

      session = next;
      watchSession(next, mine);
      setState(stateFor(loadPairingList(storage), "connected"));
    } catch (error) {
      if (mine !== generation) {
        return;
      }

      setState(stateFor(loadPairingList(storage), "disconnected"));
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
      if (getActivePairing(loadPairingList(storage))) {
        await connectActive();
      }
    },
    reconnect: connectActive,
    pair: async (tv, requestPin) => {
      const reusesActiveSocket =
        getActivePairing(loadPairingList(storage))?.tv.host === tv.host;

      if (reusesActiveSocket) {
        generation += 1;
        closeSession();
      }

      let result;

      try {
        result = await client.pair(tv, requestPin);
      } catch (error) {
        if (reusesActiveSocket) {
          connectActive().catch(() => undefined);
        }
        throw error;
      }

      generation += 1;
      closeSession();
      const list = addPairing(loadPairingList(storage), result.pairing);
      savePairingList(storage, list);
      session = result.session;
      watchSession(result.session, generation);
      setState(stateFor(list, "connected"));
    },
    switchTo: async (host) => {
      const list = loadPairingList(storage);

      if (!list.pairings.some((pairing) => pairing.tv.host === host)) {
        return;
      }

      if (list.activeHost === host && state.status === "connected") {
        return;
      }

      savePairingList(storage, setActiveHost(list, host));
      await connectActive();
    },
    forget: async (host) => {
      const before = loadPairingList(storage);
      const list = removePairing(before, host);
      savePairingList(storage, list);

      if (before.activeHost !== host) {
        setState(stateFor(list, state.status));
        return;
      }

      generation += 1;
      closeSession();

      if (list.activeHost) {
        await connectActive();
      } else {
        setState(stateFor(list, "unpaired"));
      }
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
