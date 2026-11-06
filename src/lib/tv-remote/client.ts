import { TvRemoteError } from "./tv-remote.errors";
import { splitTextEdit } from "@/utils/text-edit";
import type {
  IDiscoveredTv,
  IRemoteLibrary,
  IRemoteLibraryInstance,
  IStoredCertificate,
  IStoredPairing,
  ITvRemoteClient,
  ITvSession,
  TvDirection,
} from "./tv-remote.interface";

const DIRECTION_KEYS: Record<TvDirection, string> = {
  up: "KEYCODE_DPAD_UP",
  down: "KEYCODE_DPAD_DOWN",
  left: "KEYCODE_DPAD_LEFT",
  right: "KEYCODE_DPAD_RIGHT",
  select: "KEYCODE_DPAD_CENTER",
  back: "KEYCODE_BACK",
  home: "KEYCODE_HOME",
};

const VOLUME_KEYS = {
  up: "KEYCODE_VOLUME_UP",
  down: "KEYCODE_VOLUME_DOWN",
  mute: "KEYCODE_VOLUME_MUTE",
} as const;

const toMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const createSession = (
  remote: IRemoteLibraryInstance,
  library: IRemoteLibrary,
): ITvSession => {
  const press = (keyName: string) => {
    const code = library.keyCodes[keyName];

    if (code !== undefined) {
      remote.sendKey(code, library.shortPress);
    }
  };

  return {
    sendDirection: (direction) => press(DIRECTION_KEYS[direction]),
    sendVolume: (action) => press(VOLUME_KEYS[action]),
    sendPower: () => {
      remote.sendPower();
    },
    sendText: (edit) =>
      splitTextEdit(edit).forEach((segment) => {
        if (segment.kind === "insert") {
          remote.sendText(segment.text);
        } else {
          Array.from(segment.text).forEach(() => press("KEYCODE_DEL"));
        }
      }),
    launchApp: (appLink) => {
      remote.sendAppLink(appLink);
    },
    close: () => remote.stop(),
  };
};

const waitForReady = (
  remote: IRemoteLibraryInstance,
  failure: (message: string) => TvRemoteError,
) =>
  new Promise<void>((resolve, reject) => {
    let settled = false;

    const settle = (action: () => void) => {
      if (!settled) {
        settled = true;
        action();
      }
    };

    remote.on("ready", () => settle(resolve));
    remote.on("error", (error) =>
      settle(() =>
        reject(failure(toMessage(error, "The TV reported an error"))),
      ),
    );

    remote.start().then(
      (started) => {
        if (!started) {
          settle(() => reject(failure("The TV did not accept the connection")));
        }
      },
      (error: unknown) =>
        settle(() => reject(failure(toMessage(error, "Connection failed")))),
    );
  });

export const createTvRemoteClient = (
  library: IRemoteLibrary,
): ITvRemoteClient => ({
  async connect(pairing: IStoredPairing): Promise<ITvSession> {
    const remote = library.create(pairing.tv.host, pairing.certificate);
    const failure = (message: string) =>
      new TvRemoteError("connection", message);
    const ready = waitForReady(remote, failure);

    try {
      await ready;
    } catch (error) {
      remote.stop();
      throw error;
    }

    return createSession(remote, library);
  },

  async pair(
    tv: IDiscoveredTv,
    requestPin: () => Promise<string>,
  ): Promise<{ session: ITvSession; pairing: IStoredPairing }> {
    const remote = library.create(tv.host, null);
    const failure = (message: string) => new TvRemoteError("pairing", message);
    let cancelPairing: (error: TvRemoteError) => void = () => undefined;
    const cancelled = new Promise<never>((_, reject) => {
      cancelPairing = reject;
    });
    // Nothing may wait on `cancelled` when pairing finishes without a cancel.
    cancelled.catch(() => undefined);

    remote.on("secret", () => {
      requestPin().then(
        async (pin) => {
          // The library resolves false (and drops the connection) when the
          // code does not match, without emitting an error, so we must fail
          // the pairing ourselves or the caller waits forever.
          let accepted: unknown = false;

          try {
            accepted = await remote.sendPairingCode(pin);
          } catch {
            accepted = false;
          }

          if (accepted === false) {
            remote.stop();
            cancelPairing(
              failure(
                "The TV did not accept that code. Check it and try again",
              ),
            );
          }
        },
        () => {
          remote.stop();
          cancelPairing(failure("Pairing was cancelled"));
        },
      );
    });

    const ready = waitForReady(remote, failure);

    try {
      await Promise.race([ready, cancelled]);
    } catch (error) {
      remote.stop();
      throw error;
    }

    const { key, cert } = remote.getCertificate();

    if (!key || !cert) {
      remote.stop();
      throw failure("The TV paired but no certificate was returned");
    }

    const certificate: IStoredCertificate = { key, cert };

    return {
      session: createSession(remote, library),
      pairing: { tv: { host: tv.host, name: tv.name }, certificate },
    };
  },
});
