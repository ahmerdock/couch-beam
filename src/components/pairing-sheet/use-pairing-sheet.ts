import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import useTvRemote from "@/lib/tv-remote/use-tv-remote";
import type { IDiscoveredTv } from "@/lib/tv-remote/tv-remote.interface";
import type { IPairingSheetProps } from "./pairing-sheet.interface";
import {
  INITIAL_PAIRING_STATE,
  isValidIpv4,
  pairingSheetReducer,
  PIN_PATTERN,
  sanitizePin,
} from "./pairing-sheet.utils";

const PAIRING_FAILED =
  "Pairing didn't work. Check the code on the TV and try again.";

export default function usePairingSheet(props: IPairingSheetProps) {
  const { visible, onClose } = props;
  const { discover, pair } = useTvRemote();
  const [state, dispatch] = useReducer(
    pairingSheetReducer,
    INITIAL_PAIRING_STATE,
  );
  const [pin, setPinState] = useState("");
  const [manualHost, setManualHost] = useState("");
  const [manualName, setManualName] = useState("");
  const pinResolver = useRef<{
    resolve: (pin: string) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const scan = useCallback(() => {
    dispatch({ type: "scan-start" });
    discover().then(
      (tvs) => dispatch({ type: "scan-done", tvs }),
      () => dispatch({ type: "scan-done", tvs: [] }),
    );
  }, [discover]);

  useEffect(() => {
    if (visible) {
      scan();
    }
  }, [visible, scan]);

  const close = () => {
    pinResolver.current?.reject(new Error("closed"));
    pinResolver.current = null;
    setPinState("");
    onClose();
  };

  const selectTv = (tv: IDiscoveredTv) => {
    dispatch({ type: "select" });
    setPinState("");

    pair(
      tv,
      () =>
        new Promise<string>((resolve, reject) => {
          pinResolver.current = { resolve, reject };
          dispatch({ type: "pin-requested" });
        }),
    ).then(
      () => {
        pinResolver.current = null;
        onClose();
      },
      () => {
        pinResolver.current = null;
        dispatch({ type: "failed", message: PAIRING_FAILED });
      },
    );
  };

  const submitManual = () => {
    const host = manualHost.trim();

    if (isValidIpv4(host)) {
      selectTv({ host, name: manualName.trim() || `TV at ${host}` });
    }
  };

  const submitPin = () => {
    if (!PIN_PATTERN.test(pin) || !pinResolver.current) {
      return;
    }

    const { resolve } = pinResolver.current;
    pinResolver.current = null;
    dispatch({ type: "pin-submitted" });
    resolve(pin);
  };

  return {
    state,
    pin,
    canSubmitPin: PIN_PATTERN.test(pin),
    setPin: (text: string) => setPinState(sanitizePin(text)),
    scan,
    showManual: () => dispatch({ type: "manual" }),
    manualHost,
    manualName,
    setManualHost,
    setManualName,
    canSubmitManual: isValidIpv4(manualHost),
    submitManual,
    selectTv,
    submitPin,
    close,
  };
}
