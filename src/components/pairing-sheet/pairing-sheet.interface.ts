import type { IDiscoveredTv } from "@/lib/tv-remote/tv-remote.interface";

export interface IPairingSheetProps {
  visible: boolean;
  onClose: () => void;
}

export type PairingStep = "scanning" | "pick" | "empty" | "pin" | "connecting";

export interface IPairingSheetState {
  step: PairingStep;
  tvs: IDiscoveredTv[];
  error: string | null;
}

export type PairingSheetAction =
  | { type: "scan-start" }
  | { type: "scan-done"; tvs: IDiscoveredTv[] }
  | { type: "select" }
  | { type: "pin-requested" }
  | { type: "pin-submitted" }
  | { type: "failed"; message: string };
