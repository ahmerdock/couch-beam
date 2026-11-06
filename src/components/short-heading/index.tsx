import { Text } from "react-native";
import { IShortHeadingProps } from "./short-heading.interface";
import { shortHeadingStyles } from "./short-heading.styles";

export default function ShortHeading(props: IShortHeadingProps) {
  const { heading, style } = props;

  return (
    <Text
      accessibilityRole="header"
      style={[shortHeadingStyles.heading, style]}
    >
      {heading}
    </Text>
  );
}
