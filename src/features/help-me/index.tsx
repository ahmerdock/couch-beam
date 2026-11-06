import { ActivityIndicator, Text } from "react-native";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import ChevronUp from "lucide-react-native/icons/chevron-up";
import CircleHelp from "lucide-react-native/icons/circle-question-mark";
import { PAGE_TITLES } from "@/constants/routes";
import { ActionCard, actionCardStyles, ShortHeading } from "@/components";
import { TabsLayout } from "@/layouts";
import { HELP_ME_PRODUCTS, TROUBLESHOOTING_ENTRIES } from "./help-me.data";
import useHelpMe from "./use-help-me";

export default function HelpMe() {
  const {
    expandedId,
    toggleEntry,
    isAvailable,
    isProductsLoading,
    productsById,
    purchasingProductId,
    purchase,
  } = useHelpMe();

  return (
    <TabsLayout titleProps={{ title: PAGE_TITLES.HELP_ME }}>
      <ShortHeading heading="TROUBLESHOOTING" />

      {TROUBLESHOOTING_ENTRIES.map((entry) => {
        const isExpanded = expandedId === entry.id;

        return (
          <ActionCard
            key={entry.id}
            label={entry.title}
            description={isExpanded ? entry.answer : "Tap to see what to try"}
            icon={CircleHelp}
            onPress={() => toggleEntry(entry.id)}
            trailing={
              isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />
            }
          />
        );
      })}

      <ShortHeading heading="SUPPORT THE APP" />

      {HELP_ME_PRODUCTS.map((tier) => {
        const isPurchasing = purchasingProductId === tier.id;
        const displayPrice = productsById[tier.id]?.displayPrice;

        return (
          <ActionCard
            key={tier.id}
            label={tier.label}
            description={tier.description}
            icon={tier.icon}
            disabled={
              !isAvailable ||
              isProductsLoading ||
              !productsById[tier.id] ||
              isPurchasing
            }
            onPress={() => purchase(tier.id)}
            trailing={
              isPurchasing || (isProductsLoading && !displayPrice) ? (
                <ActivityIndicator size="small" />
              ) : displayPrice ? (
                <Text style={actionCardStyles.trailingText}>
                  {displayPrice}
                </Text>
              ) : null
            }
          />
        );
      })}
    </TabsLayout>
  );
}
