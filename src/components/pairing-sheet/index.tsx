import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUnistyles } from "react-native-unistyles";
import { IPairingSheetProps } from "./pairing-sheet.interface";
import { pairingSheetStyles } from "./pairing-sheet.styles";
import usePairingSheet from "./use-pairing-sheet";

export default function PairingSheet(props: IPairingSheetProps) {
  const { visible } = props;
  const { theme } = useUnistyles();
  const {
    state,
    pin,
    canSubmitPin,
    setPin,
    scan,
    showManual,
    manualHost,
    manualName,
    setManualHost,
    setManualName,
    canSubmitManual,
    submitManual,
    selectTv,
    submitPin,
    close,
  } = usePairingSheet(props);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        behavior="padding"
        style={pairingSheetStyles.backdrop}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={pairingSheetStyles.dismissArea}
          onPress={close}
        />

        <View style={pairingSheetStyles.sheet}>
          <Text accessibilityRole="header" style={pairingSheetStyles.title}>
            PAIR A TV
          </Text>

          {state.error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={pairingSheetStyles.error}
            >
              {state.error}
            </Text>
          ) : null}

          {state.step === "scanning" ? (
            <View accessibilityLiveRegion="polite" style={{ gap: 12 }}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={pairingSheetStyles.body}>
                Looking for TVs on your Wi-Fi...
              </Text>
            </View>
          ) : null}

          {state.step === "pick"
            ? state.tvs.map((tv) => (
                <TouchableOpacity
                  key={tv.host}
                  accessibilityRole="button"
                  activeOpacity={0.7}
                  onPress={() => selectTv(tv)}
                  style={pairingSheetStyles.tvRow}
                >
                  <Text style={pairingSheetStyles.tvName}>{tv.name}</Text>
                  <Text style={pairingSheetStyles.tvHost}>{tv.host}</Text>
                </TouchableOpacity>
              ))
            : null}

          {state.step === "empty" ? (
            <Text style={pairingSheetStyles.body}>
              No TVs found. Make sure the TV is on and on the same Wi-Fi as this
              phone.
            </Text>
          ) : null}

          {state.step === "manual" ? (
            <>
              <Text style={pairingSheetStyles.body}>
                Enter the TV&apos;s IP address from your router, for example
                when it is plugged in by cable.
              </Text>
              <TextInput
                accessibilityLabel="TV IP address"
                value={manualHost}
                onChangeText={setManualHost}
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="192.168.1.12"
                placeholderTextColor={theme.colors.textSecondary}
                style={pairingSheetStyles.fieldInput}
              />
              <TextInput
                accessibilityLabel="TV name (optional)"
                value={manualName}
                onChangeText={setManualName}
                maxLength={30}
                placeholder="Name (optional), e.g. Bedroom TV"
                placeholderTextColor={theme.colors.textSecondary}
                style={pairingSheetStyles.fieldInput}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmitManual }}
                activeOpacity={0.7}
                disabled={!canSubmitManual}
                onPress={submitManual}
                style={pairingSheetStyles.button("primary", !canSubmitManual)}
              >
                <Text style={pairingSheetStyles.buttonText("primary")}>
                  Continue
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          {state.step === "pin" ? (
            <>
              <Text style={pairingSheetStyles.body}>
                Enter the 6-character code shown on the TV.
              </Text>
              <TextInput
                accessibilityLabel="Pairing code"
                value={pin}
                onChangeText={setPin}
                autoFocus
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={6}
                placeholder="------"
                placeholderTextColor={theme.colors.textSecondary}
                style={pairingSheetStyles.input}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmitPin }}
                activeOpacity={0.7}
                disabled={!canSubmitPin}
                onPress={submitPin}
                style={pairingSheetStyles.button("primary", !canSubmitPin)}
              >
                <Text style={pairingSheetStyles.buttonText("primary")}>
                  Pair
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          {state.step === "connecting" ? (
            <View accessibilityLiveRegion="polite" style={{ gap: 12 }}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={pairingSheetStyles.body}>
                Connecting to the TV...
              </Text>
            </View>
          ) : null}

          {state.step === "pick" || state.step === "empty" ? (
            <>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.7}
                onPress={scan}
                style={pairingSheetStyles.button("secondary", false)}
              >
                <Text style={pairingSheetStyles.buttonText("secondary")}>
                  Scan again
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.7}
                onPress={showManual}
                style={pairingSheetStyles.button("secondary", false)}
              >
                <Text style={pairingSheetStyles.buttonText("secondary")}>
                  Enter IP address instead
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.7}
            onPress={close}
            style={pairingSheetStyles.button("secondary", false)}
          >
            <Text style={pairingSheetStyles.buttonText("secondary")}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
