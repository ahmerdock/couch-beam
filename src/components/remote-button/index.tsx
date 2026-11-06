import { TouchableOpacity } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import AppIcon from "../app-icon";
import { IRemoteButtonProps } from "./remote-button.interface";
import { remoteButtonStyles } from "./remote-button.styles";

export default function RemoteButton(props: IRemoteButtonProps) {
  const { label, icon, onPress, disabled = false, variant = "default" } = props;
  const { theme } = useUnistyles();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      style={remoteButtonStyles.button(variant, disabled)}
    >
      <AppIcon
        icon={icon}
        size={24}
        color={
          variant === "primary" ? theme.colors.onPrimary : theme.colors.text
        }
      />
    </TouchableOpacity>
  );
}
