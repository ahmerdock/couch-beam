import { useCallback, useState } from "react";
import useTvRemote from "@/lib/tv-remote/use-tv-remote";
import type { ITvSession } from "@/lib/tv-remote/tv-remote.interface";
import { mmkvStorage } from "@/theme/unistyles";
import { notify } from "@/utils/notify";
import type { IUseRemoteReturn, PadMode } from "./remote.interface";
import { runSessionCommand, textEditToKeys } from "./remote.utils";

const PAD_MODE_STORAGE_KEY = "couch_beam_pad_mode";
const LAUNCH_FAILED = "Couldn't open that app on the TV";

export default function useRemote(): IUseRemoteReturn {
  const { status, tv, getSession, reconnect } = useTvRemote();
  const [searchText, setSearchTextState] = useState("");
  const [padMode, setPadModeState] = useState<PadMode>(() =>
    mmkvStorage.getString(PAD_MODE_STORAGE_KEY) === "touchpad"
      ? "touchpad"
      : "dpad",
  );

  const setPadMode = (mode: PadMode) => {
    mmkvStorage.set(PAD_MODE_STORAGE_KEY, mode);
    setPadModeState(mode);
  };

  const retryConnection = useCallback(() => {
    reconnect().catch(() => undefined);
  }, [reconnect]);

  const run = useCallback(
    (command: (session: ITvSession) => void) => {
      const ok = runSessionCommand(getSession(), command);

      if (!ok) {
        retryConnection();
      }

      return ok;
    },
    [getSession, retryConnection],
  );

  const launchApp = (appLink: string) => {
    if (!run((session) => session.launchApp(appLink))) {
      notify("error", LAUNCH_FAILED);
    }
  };

  const setSearchText = (next: string) => {
    const keys = textEditToKeys(searchText, next);

    if (keys) {
      run((session) => session.sendText(keys));
    }

    setSearchTextState(next);
  };

  return {
    status,
    tvName: tv?.name ?? null,
    isConnected: status === "connected",
    padMode,
    setPadMode,
    searchText,
    setSearchText,
    pressDirection: (direction) =>
      run((session) => session.sendDirection(direction)),
    pressVolume: (action) => run((session) => session.sendVolume(action)),
    pressPower: () => run((session) => session.sendPower()),
    launchApp,
    retryConnection,
  };
}
