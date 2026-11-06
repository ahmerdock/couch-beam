import { View, Text } from "react-native";
import { IScreenTitleProps } from "./screen-title.interface";
import { screenTitleStyles } from "./screen-title.styles";

export default function ScreenTitle(props: IScreenTitleProps) {
  const { title, leading, children } = props;

  return (
    <View style={screenTitleStyles.container}>
      <View style={screenTitleStyles.left}>
        {leading}
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={screenTitleStyles.title}
        >
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}
