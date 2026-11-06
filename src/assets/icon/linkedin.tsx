import Svg, { Circle, Path, Rect } from "react-native-svg";
import { IBrandIconProps } from "@/components/app-icon/app-icon.interface";

// Outlined mark from Feather (MIT); Lucide 1.x no longer ships brand icons.
export default function LinkedinIcon(props: IBrandIconProps) {
  const { size = 24, color = "#000000", strokeWidth = 2 } = props;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <Rect x="2" y="9" width="4" height="12" />
      <Circle cx="4" cy="4" r="2" />
    </Svg>
  );
}
