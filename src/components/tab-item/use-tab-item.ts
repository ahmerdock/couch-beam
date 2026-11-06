import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { MAX_LABEL_WIDTH } from "./tab-item.data";
import { ITabItemProps } from "./tab-item.interface";

export default function useTabItem(props: ITabItemProps) {
  const { pillX, tabIndex, tabWidth } = props;

  const labelWrapperStyle = useAnimatedStyle(() => {
    if (tabWidth === 0) {
      return { opacity: 0, maxWidth: 0 };
    }

    const targetX = tabIndex * tabWidth;
    const diff = Math.abs(pillX.value - targetX);
    const fadeRange = [0, tabWidth * 0.25];
    const opacity = interpolate(diff, fadeRange, [1, 0], Extrapolation.CLAMP);
    const maxWidth = interpolate(
      diff,
      fadeRange,
      [MAX_LABEL_WIDTH, 0],
      Extrapolation.CLAMP,
    );
    return { opacity, maxWidth };
  });

  return {
    labelWrapperStyle,
  };
}
