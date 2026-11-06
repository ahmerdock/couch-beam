import type { ComponentType } from "react";

export interface IBrandIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
}

// Anything that renders like a Lucide icon: Lucide icons, or our own brand logos.
export type IAppIcon = ComponentType<IBrandIconProps>;

export interface IAppIconProps {
  icon: IAppIcon;
  size: number;
  color: string;
  strokeWidth?: number;
}
