import type { ReactNode } from "react";
import type { IAppIcon } from "@/components/app-icon/app-icon.interface";

export interface IActionCardProps {
  label: string;
  description: string;
  icon: IAppIcon;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityRole?: "button" | "link" | "switch";
  checked?: boolean;
  trailing?: ReactNode;
}
