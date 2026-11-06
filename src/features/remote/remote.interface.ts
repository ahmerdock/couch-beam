import type {
  TvConnectionStatus,
  TvDirection,
  TvVolumeAction,
} from "@/lib/tv-remote/tv-remote.interface";

export interface IUseRemoteReturn {
  status: TvConnectionStatus;
  tvName: string | null;
  isConnected: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  pressDirection: (direction: TvDirection) => void;
  pressVolume: (action: TvVolumeAction) => void;
  pressPower: () => void;
  launchApp: (appLink: string) => void;
  retryConnection: () => void;
}
