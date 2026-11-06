import { initialSwipeState, nextSwipe } from "./touchpad.utils";

describe("nextSwipe", () => {
  it("sends nothing until the finger has moved far enough to pick an axis", () => {
    const result = nextSwipe(initialSwipeState, 5, 3);

    expect(result.presses).toEqual([]);
    expect(result.state.axis).toBeNull();
  });

  it("locks to the dominant axis and presses once per step", () => {
    const first = nextSwipe(initialSwipeState, 40, 8, 36);
    expect(first.presses).toEqual(["right"]);

    const second = nextSwipe(first.state, 110, 20, 36);
    expect(second.presses).toEqual(["right", "right"]);
  });

  it("ignores movement on the other axis once locked", () => {
    const first = nextSwipe(initialSwipeState, 40, 5, 36);
    const second = nextSwipe(first.state, 41, 200, 36);

    expect(second.presses).toEqual([]);
  });

  it("supports vertical swipes in both directions", () => {
    expect(nextSwipe(initialSwipeState, 0, 80, 36).presses).toEqual([
      "down",
      "down",
    ]);
    expect(nextSwipe(initialSwipeState, 0, -40, 36).presses).toEqual(["up"]);
  });

  it("steps back when the finger reverses", () => {
    const forward = nextSwipe(initialSwipeState, 80, 0, 36);
    const back = nextSwipe(forward.state, 10, 0, 36);

    expect(back.presses).toEqual(["left", "left"]);
  });
});
