import { View, Text } from "react-native";
import { IScreenTitleProps } from "./screen-title.interface";
import { screenTitleStyles } from "./screen-title.styles";

export default function ScreenTitle(props: IScreenTitleProps) {
  const { title, children } = props;

  return (
    <View style={screenTitleStyles.container}>
      <Text accessibilityRole="header" style={screenTitleStyles.title}>
        {title}
      </Text>
      {children}
    </View>
  );
}
