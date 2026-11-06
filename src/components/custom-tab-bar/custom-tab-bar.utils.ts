import HeartHandshake from "lucide-react-native/icons/heart-handshake";
import House from "lucide-react-native/icons/house";
import Settings from "lucide-react-native/icons/settings";
import { IAppIcon } from "@/components/app-icon/app-icon.interface";
import { PAGE_TITLES, ROUTE_NAMES } from "@/constants/routes";

export const TAB_CONFIG: Partial<
  Record<string, { icon: IAppIcon; label: string }>
> = {
  [ROUTE_NAMES.HOME]: { icon: House, label: PAGE_TITLES.HOME },
  [ROUTE_NAMES.HELP_ME]: { icon: HeartHandshake, label: PAGE_TITLES.HELP_ME },
  [ROUTE_NAMES.SETTINGS]: { icon: Settings, label: PAGE_TITLES.SETTINGS },
};
