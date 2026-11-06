import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import type { IPairedTv } from "@/lib/tv-remote/tv-remote.interface";
import useTvRemote from "@/lib/tv-remote/use-tv-remote";
import type { IUseHomeReturn } from "./home.interface";

export default function useHome(): IUseHomeReturn {
  const router = useRouter();
  const { tv, tvs, status, forget, switchTo } = useTvRemote();
  const [isPairingSheetOpen, setIsPairingSheetOpen] = useState(false);

  // Tapping a TV makes it the active one and opens its controls right away;
  // the controls screen shows connecting and unreachable states itself.
  const openTv = (target: IPairedTv) => {
    if (target.host !== tv?.host) {
      switchTo(target.host).catch(() => undefined);
    }

    router.push("/remote");
  };

  const confirmForgetTv = (target: IPairedTv) => {
    Alert.alert(
      `Forget ${target.name}?`,
      "You will need a new pairing code to use it again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Forget",
          style: "destructive",
          onPress: () => {
            const wasLast = tvs.length === 1;

            forget(target.host)
              .then(() => {
                if (wasLast) {
                  setIsPairingSheetOpen(true);
                }
              })
              .catch(() => undefined);
          },
        },
      ],
    );
  };

  return {
    tvs,
    activeHost: tv?.host ?? null,
    tvStatus: status,
    isPairingSheetOpen,
    openTv,
    openPairingSheet: () => setIsPairingSheetOpen(true),
    closePairingSheet: () => setIsPairingSheetOpen(false),
    confirmForgetTv,
  };
}
