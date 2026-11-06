import Plus from "lucide-react-native/icons/plus";
import Tv from "lucide-react-native/icons/tv";
import { Text, TouchableOpacity } from "react-native";
import { ActionCard, PairingSheet, ShortHeading } from "@/components";
import { PAGE_TITLES } from "@/constants/routes";
import { TabsLayout } from "@/layouts";
import { TV_STATUS_LABELS } from "./home.data";
import { homeStyles } from "./home.styles";
import useHome from "./use-home";

export default function Home() {
  const {
    tvs,
    activeHost,
    tvStatus,
    isPairingSheetOpen,
    openTv,
    openPairingSheet,
    closePairingSheet,
    confirmForgetTv,
  } = useHome();

  return (
    <TabsLayout titleProps={{ title: PAGE_TITLES.HOME }}>
      {tvs.length > 0 ? <ShortHeading heading="YOUR TVS" /> : null}

      {tvs.map((tv) => (
        <ActionCard
          key={tv.host}
          label={tv.name}
          description={
            tv.host === activeHost
              ? TV_STATUS_LABELS[tvStatus]
              : "Saved. Tap to connect"
          }
          icon={Tv}
          onPress={() => openTv(tv)}
          trailing={
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Forget ${tv.name}`}
              activeOpacity={0.7}
              onPress={() => confirmForgetTv(tv)}
            >
              <Text style={homeStyles.forgetText}>Forget</Text>
            </TouchableOpacity>
          }
        />
      ))}

      <ActionCard
        label={tvs.length > 0 ? "Add a TV" : "Pair a TV"}
        description="Find an Android TV or Google TV on Wi-Fi"
        icon={tvs.length > 0 ? Plus : Tv}
        onPress={openPairingSheet}
      />

      <PairingSheet visible={isPairingSheetOpen} onClose={closePairingSheet} />
    </TabsLayout>
  );
}
