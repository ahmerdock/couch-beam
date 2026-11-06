import { IAppIcon } from "@/components/app-icon/app-icon.interface";
import { SharedValue } from "react-native-reanimated";

export interface ITabItemProps {
  icon: IAppIcon;
  label: string;
  isFocused: boolean;
  onPress: () => void;
  pillX: SharedValue<number>;
  tabIndex: number;
  tabWidth: number;
}
