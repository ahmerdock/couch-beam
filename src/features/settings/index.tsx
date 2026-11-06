import Moon from "lucide-react-native/icons/moon";
import Sun from "lucide-react-native/icons/sun";
import Tv from "lucide-react-native/icons/tv";
import Unplug from "lucide-react-native/icons/unplug";
import { TabsLayout } from "@/layouts";
import {
  ActionCard,
  CustomSwitch,
  PairingSheet,
  ShortHeading,
} from "@/components";
import { PAGE_TITLES } from "@/constants/routes";
import { CONTACT_LINKS, TV_STATUS_LABELS } from "./settings.data";
import { settingsStyles } from "./settings.styles";
import useSettings from "./use-settings";

export default function Settings() {
  const {
    isDark,
    toggleTheme,
    openLink,
    tvName,
    tvStatus,
    isPairingSheetOpen,
    openPairingSheet,
    closePairingSheet,
    forgetTv,
  } = useSettings();

  return (
    <TabsLayout titleProps={{ title: PAGE_TITLES.SETTINGS }}>
      <ShortHeading heading="YOUR TV" />

      {tvName ? (
        <>
          <ActionCard
            label={tvName}
            description={TV_STATUS_LABELS[tvStatus]}
            icon={Tv}
          />
          <ActionCard
            label="Forget this TV"
            description="Remove the saved pairing and pair a different TV"
            icon={Unplug}
            onPress={forgetTv}
          />
        </>
      ) : (
        <ActionCard
          label="Pair a TV"
          description="Find your Android TV or Google TV on Wi-Fi"
          icon={Tv}
          onPress={openPairingSheet}
        />
      )}

      <ShortHeading heading="APPEARANCE" style={settingsStyles.section} />

      <ActionCard
        label="Dark Mode"
        description={isDark ? "Currently active" : "Currently off"}
        icon={isDark ? Moon : Sun}
        accessibilityRole="switch"
        checked={isDark}
        onPress={toggleTheme}
        trailing={
          <CustomSwitch
            value={isDark}
            onValueChange={toggleTheme}
            accessibilityLabel="Dark Mode"
          />
        }
      />

      <ShortHeading heading="CONTACT ME" style={settingsStyles.section} />

      {CONTACT_LINKS.map((link) => (
        <ActionCard
          key={link.label}
          label={link.label}
          description={link.description}
          icon={link.icon}
          accessibilityRole="link"
          onPress={() => openLink(link.url)}
        />
      ))}

      <PairingSheet visible={isPairingSheetOpen} onClose={closePairingSheet} />
    </TabsLayout>
  );
}
