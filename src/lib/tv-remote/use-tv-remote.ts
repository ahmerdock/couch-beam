import { useSyncExternalStore } from "react";
import { discoverTvs } from "./discovery";
import { getTvRemoteStore } from "./tv-remote.store";

export default function useTvRemote() {
  const store = getTvRemoteStore();
  const state = useSyncExternalStore(store.subscribe, store.getState);

  return {
    status: state.status,
    tv: state.tv,
    getSession: store.getSession,
    discover: discoverTvs,
    pair: store.pair,
    forget: store.forget,
    reconnect: store.reconnect,
  };
}
