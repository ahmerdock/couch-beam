import type { IAppIcon } from "@/components/app-icon/app-icon.interface";

export interface IRemoteButtonProps {
  label: string;
  icon: IAppIcon;
  onPress: () => void;
  disabled?: boolean;
  variant?: "default" | "primary";
}
