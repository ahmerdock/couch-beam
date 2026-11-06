import { useCallback, useState } from "react";
import { AccessibilityInfo } from "react-native";
import Toast from "react-native-toast-message";
import useTvRemote from "@/lib/tv-remote/use-tv-remote";
import type { ITvSession } from "@/lib/tv-remote/tv-remote.interface";
import type { IUseRemoteReturn } from "./remote.interface";
import { runSessionCommand, textEditToKeys } from "./remote.utils";

const LAUNCH_FAILED = "Couldn't open that app on the TV";

export default function useRemote(): IUseRemoteReturn {
  const { status, tv, getSession, reconnect } = useTvRemote();
  const [searchText, setSearchTextState] = useState("");

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
      Toast.show({ type: "error", text1: LAUNCH_FAILED });
      AccessibilityInfo.announceForAccessibility(LAUNCH_FAILED);
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
