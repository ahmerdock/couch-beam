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
  const { state, pin, canSubmitPin, setPin, scan, selectTv, submitPin, close } =
    usePairingSheet(props);

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
