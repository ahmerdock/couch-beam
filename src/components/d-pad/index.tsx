import { View } from "react-native";
import ArrowDown from "lucide-react-native/icons/arrow-down";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import ArrowUp from "lucide-react-native/icons/arrow-up";
import Circle from "lucide-react-native/icons/circle";
import RemoteButton from "../remote-button";
import { IDPadProps } from "./d-pad.interface";
import { dPadStyles } from "./d-pad.styles";

export default function DPad(props: IDPadProps) {
  const { onPress, disabled = false } = props;

  return (
    <View style={dPadStyles.container}>
      <RemoteButton
        label="Up"
        icon={ArrowUp}
        disabled={disabled}
        onPress={() => onPress("up")}
      />
      <View style={dPadStyles.row}>
        <RemoteButton
          label="Left"
          icon={ArrowLeft}
          disabled={disabled}
          onPress={() => onPress("left")}
        />
        <RemoteButton
          label="Select"
          icon={Circle}
          variant="primary"
          disabled={disabled}
          onPress={() => onPress("select")}
        />
        <RemoteButton
          label="Right"
          icon={ArrowRight}
          disabled={disabled}
          onPress={() => onPress("right")}
        />
      </View>
      <RemoteButton
        label="Down"
        icon={ArrowDown}
        disabled={disabled}
        onPress={() => onPress("down")}
      />
    </View>
  );
}
