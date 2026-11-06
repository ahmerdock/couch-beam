import { Buffer } from "buffer";
import {
  AndroidRemote,
  RemoteDirection,
  RemoteKeyCode,
} from "react-native-androidtv-remote";
import { encodeImeTextMessage, readImeCounters } from "./text-protocol";
import type {
  IRemoteLibrary,
  IRemoteLibraryInstance,
  IStoredCertificate,
} from "./tv-remote.interface";

const KEYSTORE_OPTIONS = {
  androidKeyStore: "AndroidKeyStore",
  certAlias: "couch-beam-cert",
  keyAlias: "couch-beam-key",
};

interface ISocketLike {
  on: (event: string, listener: (chunk: unknown) => void) => unknown;
  write: (data: Buffer) => unknown;
}

type LibraryRemote = IRemoteLibraryInstance & {
  remoteManager?: { client?: ISocketLike } | null;
};

// The library cannot send text, so we write the IME message to its socket and
// follow the counters the TV puts on its own IME messages (as the reference
// Python implementation does).
const addTextSupport = (remote: LibraryRemote) => {
  const counters = { imeCounter: 0, fieldCounter: 0 };
  let tracked: ISocketLike | null = null;

  const track = () => {
    const client = remote.remoteManager?.client;

    if (!client || client === tracked) {
      return;
    }

    tracked = client;
    client.on("data", (chunk) => {
      const read = readImeCounters(Buffer.from(chunk as Uint8Array));

      if (read) {
        counters.imeCounter = read.imeCounter;
        counters.fieldCounter = read.fieldCounter;
      }
    });
  };

  remote.on("ready", track);
  remote.sendText = (text: string) => {
    track();
    remote.remoteManager?.client?.write(
      encodeImeTextMessage(counters.imeCounter, counters.fieldCounter, text),
    );
  };

  return remote;
};

export const remoteLibrary: IRemoteLibrary = {
  create: (host: string, certificate: IStoredCertificate | null) =>
    addTextSupport(
      new AndroidRemote(host, {
        pairing_port: 6467,
        remote_port: 6466,
        service_name: "com.ahmerdock.couchbeam",
        systeminfo: { manufacturer: "Couch Beam", model: "Phone" },
        cert: {
          key: certificate?.key ?? null,
          cert: certificate?.cert ?? null,
          ...KEYSTORE_OPTIONS,
        },
      }) as unknown as LibraryRemote,
    ),
  keyCodes: RemoteKeyCode as Record<string, number>,
  shortPress: (RemoteDirection as Record<string, number>).SHORT,
};
