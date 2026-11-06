import { DEFAULT_STROKE_WIDTH } from "./app-icon.data";
import { IAppIconProps } from "./app-icon.interface";

export default function AppIcon(props: IAppIconProps) {
  const { icon: Icon, size, color, strokeWidth = DEFAULT_STROKE_WIDTH } = props;

  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
