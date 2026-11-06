import Moon from "lucide-react-native/icons/moon";
import Sun from "lucide-react-native/icons/sun";
import { TabsLayout } from "@/layouts";
import { ActionCard, CustomSwitch, ShortHeading } from "@/components";
import { PAGE_TITLES } from "@/constants/routes";
import { CONTACT_LINKS } from "./settings.data";
import { settingsStyles } from "./settings.styles";
import useSettings from "./use-settings";

export default function Settings() {
  const { isDark, toggleTheme, openLink } = useSettings();

  return (
    <TabsLayout titleProps={{ title: PAGE_TITLES.SETTINGS }}>
      <ShortHeading heading="APPEARANCE" />

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
    </TabsLayout>
  );
}
