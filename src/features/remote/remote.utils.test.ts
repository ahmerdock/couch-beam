import type { ITvSession } from "@/lib/tv-remote/tv-remote.interface";
import { runSessionCommand, textEditToKeys } from "./remote.utils";

const createSession = (): jest.Mocked<ITvSession> => ({
  sendDirection: jest.fn(),
  sendVolume: jest.fn(),
  sendPower: jest.fn(),
  sendText: jest.fn(),
  launchApp: jest.fn(),
  close: jest.fn(),
});

describe("runSessionCommand", () => {
  it("passes a D-pad press to the session with the right direction", () => {
    const session = createSession();

    const ok = runSessionCommand(session, (s) => s.sendDirection("left"));

    expect(ok).toBe(true);
    expect(session.sendDirection).toHaveBeenCalledWith("left");
  });

  it("launches an app with the shortcut's link", () => {
    const session = createSession();

    runSessionCommand(session, (s) => s.launchApp("https://www.youtube.com"));

    expect(session.launchApp).toHaveBeenCalledWith("https://www.youtube.com");
  });

  it("does nothing and reports false when there is no session", () => {
    const command = jest.fn();

    expect(runSessionCommand(null, command)).toBe(false);
    expect(command).not.toHaveBeenCalled();
  });

  it("reports false when the session throws", () => {
    const session = createSession();
    session.sendPower.mockImplementation(() => {
      throw new Error("socket closed");
    });

    expect(runSessionCommand(session, (s) => s.sendPower())).toBe(false);
  });
});

describe("textEditToKeys", () => {
  it("sends only the newly typed characters", () => {
    expect(textEditToKeys("cat", "cats")).toBe("s");
  });

  it("sends backspaces for removed characters", () => {
    expect(textEditToKeys("cats", "cat")).toBe("\b");
  });

  it("replaces from the first differing character", () => {
    expect(textEditToKeys("cat", "cow")).toBe("\b\bow");
  });

  it("sends nothing when the text is unchanged", () => {
    expect(textEditToKeys("cat", "cat")).toBe("");
  });
});
