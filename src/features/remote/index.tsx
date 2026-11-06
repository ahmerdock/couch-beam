import { Text, TextInput, TouchableOpacity, View } from "react-native";
import House from "lucide-react-native/icons/house";
import Power from "lucide-react-native/icons/power";
import Undo2 from "lucide-react-native/icons/undo-2";
import Volume1 from "lucide-react-native/icons/volume-1";
import Volume2 from "lucide-react-native/icons/volume-2";
import VolumeX from "lucide-react-native/icons/volume-x";
import { useUnistyles } from "react-native-unistyles";
import {
  ActionCard,
  DPad,
  RemoteButton,
  ShortHeading,
  Touchpad,
} from "@/components";
import { PAGE_TITLES } from "@/constants/routes";
import { TabsLayout } from "@/layouts";
import { APP_SHORTCUTS, PAD_MODES } from "./remote.data";
import { remoteStyles } from "./remote.styles";
import useRemote from "./use-remote";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import Tv from "lucide-react-native/icons/tv";
import { useRouter } from "expo-router";

export default function Remote() {
  const {
    status,
    tvName,
    isConnected,
    padMode,
    setPadMode,
    searchText,
    setSearchText,
    pressDirection,
    pressVolume,
    pressPower,
    launchApp,
    retryConnection,
  } = useRemote();
  const { theme } = useUnistyles();
  const router = useRouter();

  const backButton = (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Back to your TVs"
      activeOpacity={0.7}
      onPress={() => router.back()}
      style={remoteStyles.backButton}
    >
      <ChevronLeft size={28} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  if (status === "unpaired") {
    return (
      <TabsLayout
        titleProps={{ title: PAGE_TITLES.REMOTE, leading: backButton }}
      >
        <ActionCard
          label="No TV paired yet"
          description="Go back to Home and tap Pair a TV to get started"
          icon={Tv}
        />
      </TabsLayout>
    );
  }

  return (
    <TabsLayout
      titleProps={{ title: tvName ?? PAGE_TITLES.REMOTE, leading: backButton }}
    >
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

      <View style={remoteStyles.modeToggle} accessibilityRole="tablist">
        {PAD_MODES.map((mode) => (
          <TouchableOpacity
            key={mode.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: padMode === mode.id }}
            activeOpacity={0.7}
            onPress={() => setPadMode(mode.id)}
            style={[
              remoteStyles.modeOption,
              padMode === mode.id && remoteStyles.modeOptionActive,
            ]}
          >
            <Text
              style={[
                remoteStyles.modeText,
                padMode === mode.id && remoteStyles.modeTextActive,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {padMode === "touchpad" ? (
        <Touchpad onPress={pressDirection} disabled={!isConnected} />
      ) : (
        <DPad onPress={pressDirection} disabled={!isConnected} />
      )}

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
