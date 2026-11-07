import { createTvRemoteClient } from "./client";
import { isTvRemoteError } from "./tv-remote.errors";
import { createFakeLibrary, pairing } from "./test-utils";

describe("tv remote client", () => {
  it("reconnects with a stored certificate and no PIN request", async () => {
    const { library } = createFakeLibrary("ready");
    const client = createTvRemoteClient(library);
    const requestPin = jest.fn();

    const session = await client.connect(pairing);

    expect(session).toBeDefined();
    expect(requestPin).not.toHaveBeenCalled();
  });

  it("tells the session owner when the TV unpairs after ready", async () => {
    const { library, instances } = createFakeLibrary("ready");
    const session = await createTvRemoteClient(library).connect(pairing);
    const lost = jest.fn();

    session.onLost?.(lost);
    instances[0].emit("unpaired");

    expect(lost).toHaveBeenCalledTimes(1);
  });

  it("pairs with a PIN and returns a certificate to persist", async () => {
    const { library, instances } = createFakeLibrary("ready");
    const client = createTvRemoteClient(library);
    const requestPin = jest.fn().mockResolvedValue("1A2B3C");

    const result = await client.pair(pairing.tv, requestPin);

    expect(requestPin).toHaveBeenCalledTimes(1);
    expect(instances[0].sendPairingCode).toHaveBeenCalledWith("1A2B3C");
    expect(result.pairing).toEqual(pairing);
  });

  it("surfaces a typed pairing error when the code is rejected", async () => {
    const { library } = createFakeLibrary("bad-pin");
    const client = createTvRemoteClient(library);

    const error = await client
      .pair(pairing.tv, () => Promise.resolve("000000"))
      .catch((e: unknown) => e);

    expect(isTvRemoteError(error, "pairing")).toBe(true);
  });

  it("surfaces a connection error, distinct from a pairing error, when the TV is unreachable", async () => {
    const { library } = createFakeLibrary("unreachable");
    const client = createTvRemoteClient(library);

    const error = await client.connect(pairing).catch((e: unknown) => e);

    expect(isTvRemoteError(error, "connection")).toBe(true);
    expect(isTvRemoteError(error, "pairing")).toBe(false);
  });

  it("rejects with a pairing error when the user cancels at the PIN step", async () => {
    const { library } = createFakeLibrary("ready");
    const client = createTvRemoteClient(library);

    const error = await client
      .pair(pairing.tv, () => Promise.reject(new Error("closed")))
      .catch((e: unknown) => e);

    expect(isTvRemoteError(error, "pairing")).toBe(true);
  });

  it("sends directions as key codes and text through the library's text call", async () => {
    const { library, sentKeys, instances } = createFakeLibrary("ready");
    const session = await createTvRemoteClient(library).connect(pairing);

    session.sendDirection("left");
    session.sendText("hi\b");

    expect(instances[0].sendText).toHaveBeenCalledWith("hi");
    expect(sentKeys).toEqual([21, 67]);
  });
});
