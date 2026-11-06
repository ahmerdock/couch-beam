import Zeroconf from "react-native-zeroconf";
import type { IDiscoveredTv } from "./tv-remote.interface";

const SERVICE_TYPE = "androidtvremote2";
const SCAN_TIMEOUT_MS = 6000;

interface IZeroconfService {
  name: string;
  host?: string;
  addresses?: string[];
}

const isIpv4 = (address: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(address);

export const toDiscoveredTv = (
  service: IZeroconfService,
): IDiscoveredTv | null => {
  const host = service.addresses?.find(isIpv4) ?? service.host;

  return host ? { name: service.name, host } : null;
};

export const discoverTvs = (): Promise<IDiscoveredTv[]> =>
  new Promise((resolve) => {
    const zeroconf = new Zeroconf();
    const found = new Map<string, IDiscoveredTv>();

    const finish = () => {
      clearTimeout(timer);
      zeroconf.stop();
      zeroconf.removeAllListeners();
      resolve([...found.values()]);
    };

    const timer = setTimeout(finish, SCAN_TIMEOUT_MS);

    zeroconf.on("resolved", (service: IZeroconfService) => {
      const tv = toDiscoveredTv(service);

      if (tv) {
        found.set(tv.host, tv);
      }
    });
    zeroconf.on("error", finish);
    zeroconf.scan(SERVICE_TYPE, "tcp", "local.");
  });
