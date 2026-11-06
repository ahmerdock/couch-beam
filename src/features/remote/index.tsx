import { Text, TextInput, TouchableOpacity, View } from "react-native";
import House from "lucide-react-native/icons/house";
import Power from "lucide-react-native/icons/power";
import Undo2 from "lucide-react-native/icons/undo-2";
import Volume1 from "lucide-react-native/icons/volume-1";
import Volume2 from "lucide-react-native/icons/volume-2";
import VolumeX from "lucide-react-native/icons/volume-x";
import { useUnistyles } from "react-native-unistyles";
import { ActionCard, DPad, RemoteButton, ShortHeading } from "@/components";
import { PAGE_TITLES } from "@/constants/routes";
import { TabsLayout } from "@/layouts";
import { APP_SHORTCUTS } from "./remote.data";
import { remoteStyles } from "./remote.styles";
import useRemote from "./use-remote";
import Tv from "lucide-react-native/icons/tv";

export default function Remote() {
  const {
    status,
    tvName,
    isConnected,
    searchText,
    setSearchText,
    pressDirection,
    pressVolume,
    pressPower,
    launchApp,
    retryConnection,
  } = useRemote();
  const { theme } = useUnistyles();

  if (status === "unpaired") {
    return (
      <TabsLayout titleProps={{ title: PAGE_TITLES.HOME }}>
        <ActionCard
          label="No TV paired yet"
          description="Open Settings and tap Pair a TV to get started"
          icon={Tv}
        />
      </TabsLayout>
    );
  }

  return (
    <TabsLayout titleProps={{ title: PAGE_TITLES.HOME }}>
      {status === "connecting" ? (
        <View style={remoteStyles.banner} accessibilityLiveRegion="polite">
          <Text style={remoteStyles.bannerText}>
            Connecting to {tvName ?? "your TV"}...
          </Text>
        </View>
      ) : null}

      {status === "disconnected" ? (
        <View style={remoteStyles.banner} accessibilityLiveRegion="polite">
          <Text style={remoteStyles.bannerText}>
            Can&apos;t reach {tvName ?? "your TV"}. Check that it is on and on
            the same Wi-Fi.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={retryConnection}
            style={remoteStyles.bannerButton}
          >
            <Text style={remoteStyles.bannerButtonText}>Reconnect</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <DPad onPress={pressDirection} disabled={!isConnected} />

      <View style={remoteStyles.row}>
        <RemoteButton
          label="Back"
          icon={Undo2}
          disabled={!isConnected}
          onPress={() => pressDirection("back")}
        />
        <RemoteButton
          label="Home"
          icon={House}
          disabled={!isConnected}
          onPress={() => pressDirection("home")}
        />
        <RemoteButton
          label="Power"
          icon={Power}
          variant="primary"
          disabled={!isConnected}
          onPress={pressPower}
        />
      </View>

      <View style={remoteStyles.row}>
        <RemoteButton
          label="Volume down"
          icon={Volume1}
          disabled={!isConnected}
          onPress={() => pressVolume("down")}
        />
        <RemoteButton
          label="Mute"
          icon={VolumeX}
          disabled={!isConnected}
          onPress={() => pressVolume("mute")}
        />
        <RemoteButton
          label="Volume up"
          icon={Volume2}
          disabled={!isConnected}
          onPress={() => pressVolume("up")}
        />
      </View>

      <ShortHeading heading="TYPE TO SEARCH" style={remoteStyles.section} />
      <TextInput
        accessibilityLabel="Type into the TV's focused field"
        value={searchText}
        onChangeText={setSearchText}
        editable={isConnected}
        placeholder="Open a search box on the TV, then type here"
        placeholderTextColor={theme.colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={remoteStyles.input}
      />

      <ShortHeading heading="APPS" />
      {APP_SHORTCUTS.map((app) => (
        <ActionCard
          key={app.id}
          label={app.label}
          description={`Open ${app.label} on the TV`}
          icon={app.icon}
          disabled={!isConnected}
          onPress={() => launchApp(app.appLink)}
        />
      ))}
    </TabsLayout>
  );
}
