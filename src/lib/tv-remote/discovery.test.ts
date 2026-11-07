import { discoverTvs, toDiscoveredTv } from "./discovery";

const mockZeroconf = jest.fn();

jest.mock("react-native-zeroconf", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { EventEmitter } = require("events");

  return {
    __esModule: true,
    default: class FakeZeroconf extends EventEmitter {
      scan = jest.fn();
      stop = jest.fn();

      constructor() {
        super();
        mockZeroconf(this);
      }
    },
  };
});

describe("toDiscoveredTv", () => {
  it("prefers an IPv4 address over the host name", () => {
    expect(
      toDiscoveredTv({
        name: "TV",
        host: "tv.local.",
        addresses: ["fe80::1", "192.168.1.20"],
      }),
    ).toEqual({ name: "TV", host: "192.168.1.20" });
  });

  it("falls back to the host name when there is no IPv4 address", () => {
    expect(
      toDiscoveredTv({ name: "TV", host: "tv.local.", addresses: ["fe80::1"] }),
    ).toEqual({ name: "TV", host: "tv.local." });
  });

  it("returns null when the service has no usable address", () => {
    expect(toDiscoveredTv({ name: "TV" })).toBeNull();
  });
});

describe("discoverTvs", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockZeroconf.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("collects each TV once and stops scanning at the timeout", async () => {
    const result = discoverTvs();
    const zeroconf = mockZeroconf.mock.calls[0][0];

    zeroconf.emit("resolved", { name: "TV", addresses: ["192.168.1.20"] });
    zeroconf.emit("resolved", {
      name: "TV again",
      addresses: ["192.168.1.20"],
    });
    zeroconf.emit("resolved", { name: "Box", addresses: ["192.168.1.12"] });
    jest.advanceTimersByTime(6000);

    await expect(result).resolves.toHaveLength(2);
    expect(zeroconf.scan).toHaveBeenCalledWith(
      "androidtvremote2",
      "tcp",
      "local.",
    );
    expect(zeroconf.stop).toHaveBeenCalled();
  });

  it("finishes early with what it found when scanning errors", async () => {
    const result = discoverTvs();
    const zeroconf = mockZeroconf.mock.calls[0][0];

    zeroconf.emit("resolved", { name: "TV", addresses: ["192.168.1.20"] });
    zeroconf.emit("error", new Error("mDNS failed"));

    await expect(result).resolves.toEqual([
      { name: "TV", host: "192.168.1.20" },
    ]);
    expect(zeroconf.stop).toHaveBeenCalled();
  });
});
