export interface IDiscoveredTv {
  name: string;
  host: string;
}

export type IPairedTv = IDiscoveredTv;

export interface IStoredCertificate {
  key: string;
  cert: string;
}

export interface IStoredPairing {
  tv: IPairedTv;
  certificate: IStoredCertificate;
}

export interface IPairingList {
  activeHost: string | null;
  pairings: IStoredPairing[];
}

export type TvDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "select"
  | "back"
  | "home";

export type TvVolumeAction = "up" | "down" | "mute";

export interface ITvSession {
  sendDirection: (direction: TvDirection) => void;
  sendVolume: (action: TvVolumeAction) => void;
  sendPower: () => void;
  sendText: (text: string) => void;
  launchApp: (appLink: string) => void;
  // Fires when the TV drops or revokes the session after it was ready.
  onLost?: (listener: () => void) => void;
  close: () => void;
}

export interface ITvRemoteClient {
  pair: (
    tv: IDiscoveredTv,
    requestPin: () => Promise<string>,
  ) => Promise<{ session: ITvSession; pairing: IStoredPairing }>;
  connect: (pairing: IStoredPairing) => Promise<ITvSession>;
}

export type TvConnectionStatus =
  | "unpaired"
  | "connecting"
  | "connected"
  | "disconnected";

export interface ITvRemoteState {
  status: TvConnectionStatus;
  tv: IPairedTv | null;
  tvs: IPairedTv[];
}

export interface IKeyValueStore {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => unknown;
}

// Minimal surface of react-native-androidtv-remote's AndroidRemote that we use.
export interface IRemoteLibraryInstance {
  on: (event: string, listener: (...args: unknown[]) => void) => unknown;
  start: () => Promise<unknown>;
  sendPairingCode: (code: string) => unknown;
  sendKey: (key: number, direction: number) => unknown;
  sendPower: () => unknown;
  sendAppLink: (link: string) => unknown;
  sendText: (text: string) => unknown;
  getCertificate: () => { key?: string; cert?: string };
  stop: () => void;
}

export interface IRemoteLibrary {
  create: (
    host: string,
    certificate: IStoredCertificate | null,
  ) => IRemoteLibraryInstance;
  keyCodes: Record<string, number>;
  shortPress: number;
}
