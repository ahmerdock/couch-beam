import { useState } from "react";
import { Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Move from "lucide-react-native/icons/move";
import { useUnistyles } from "react-native-unistyles";
import { ITouchpadProps } from "./touchpad.interface";
import { touchpadStyles } from "./touchpad.styles";
import { createSwipeTracker } from "./touchpad.utils";

export default function Touchpad(props: ITouchpadProps) {
  const { onPress, disabled = false } = props;
  const { theme } = useUnistyles();
  const [swipe] = useState(createSwipeTracker);

  const pan = Gesture.Pan()
    .runOnJS(true)
    .enabled(!disabled)
    .minDistance(4)
    .onStart(() => {
      swipe.reset();
    })
    .onUpdate((event) => {
      swipe
        .update(event.translationX, event.translationY)
        .forEach((direction) => onPress(direction));
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .enabled(!disabled)
    .maxDistance(10)
    .onEnd((_event, success) => {
      if (success) {
        onPress("select");
      }
    });

  return (
    <GestureDetector gesture={Gesture.Race(pan, tap)}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="Touchpad. Swipe to move, tap to select"
        style={[touchpadStyles.pad, disabled && touchpadStyles.disabled]}
      >
        <Move size={32} color={theme.colors.textSecondary} />
        <Text style={touchpadStyles.hint}>Swipe to move, tap to select</Text>
      </View>
    </GestureDetector>
  );
}
