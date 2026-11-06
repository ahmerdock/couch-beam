import { useEffect } from "react";
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { THUMB_TRAVEL } from "./custom-switch.data";
import { ICustomSwitchProps } from "./custom-switch.interface";

export default function useCustomSwitch(props: ICustomSwitchProps) {
  const { value, onValueChange } = props;

  // Starts at the right spot so the thumb does not slide in on first render.
  const translateX = useSharedValue(value ? THUMB_TRAVEL : 0);

  // Follows `value`, so changes made outside the switch move the thumb too.
  useEffect(() => {
    translateX.value = withSpring(value ? THUMB_TRAVEL : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [value, translateX]);

  const toggleSwitch = () => onValueChange(!value);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return {
    toggleSwitch,
    thumbStyle,
  };
}
