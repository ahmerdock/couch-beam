import { ReactNode } from "react";
import { IScreenTitleProps } from "@/components/screen-title/screen-title.interface";

export interface ITabsLayoutProps {
  children?: ReactNode;
  titleProps: IScreenTitleProps;
}
