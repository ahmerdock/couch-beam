import { Text, TouchableOpacity, View } from "react-native";
import { useUnistyles } from "react-native-unistyles";
import AppIcon from "../app-icon";
import Card from "../card";
import { IActionCardProps } from "./action-card.interface";
import { actionCardStyles } from "./action-card.styles";

export default function ActionCard(props: IActionCardProps) {
  const {
    label,
    description,
    icon,
    onPress,
    disabled = false,
    trailing,
    accessibilityRole = "button",
    checked,
  } = props;

  const { theme } = useUnistyles();

  const content = (
    <Card>
      <View style={actionCardStyles.iconWrap}>
        <AppIcon icon={icon} size={20} color={theme.colors.primary} />
      </View>

      <View style={actionCardStyles.textWrap}>
        <Text style={actionCardStyles.label}>{label}</Text>
        <Text style={actionCardStyles.description}>{description}</Text>
      </View>

      {trailing ? (
        <View style={actionCardStyles.trailingWrap}>{trailing}</View>
      ) : null}
    </Card>
  );

  if (!onPress) {
    return content;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled, checked }}
      style={disabled && actionCardStyles.disabled}
    >
      {content}
    </TouchableOpacity>
  );
}
