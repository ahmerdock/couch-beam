import type { TvConnectionStatus } from "@/lib/tv-remote/tv-remote.interface";

export interface IUseSettingsReturn {
  isDark: boolean;
  toggleTheme: () => void;
  openLink: (url: string) => Promise<void>;
  tvName: string | null;
  tvStatus: TvConnectionStatus;
  isPairingSheetOpen: boolean;
  openPairingSheet: () => void;
  closePairingSheet: () => void;
  forgetTv: () => void;
}
