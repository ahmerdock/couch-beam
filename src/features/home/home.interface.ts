import type {
  IPairedTv,
  TvConnectionStatus,
} from "@/lib/tv-remote/tv-remote.interface";

export interface IUseHomeReturn {
  tvs: IPairedTv[];
  activeHost: string | null;
  tvStatus: TvConnectionStatus;
  isPairingSheetOpen: boolean;
  openTv: (tv: IPairedTv) => void;
  openPairingSheet: () => void;
  closePairingSheet: () => void;
  confirmForgetTv: (tv: IPairedTv) => void;
}
