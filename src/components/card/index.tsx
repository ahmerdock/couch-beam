import { View } from "react-native";
import { cardStyles } from "./card.styles";
import { ICardProps } from "./card.interface";

export default function Card(props: ICardProps) {
  const { children } = props;

  return <View style={cardStyles.container}>{children}</View>;
}
