import type { TvDirection } from "@/lib/tv-remote/tv-remote.interface";

export const SWIPE_STEP = 36;
export const AXIS_LOCK_DISTANCE = 12;

export interface ISwipeState {
  axis: "x" | "y" | null;
  // Signed number of presses already sent along the locked axis.
  emitted: number;
}

export const initialSwipeState: ISwipeState = { axis: null, emitted: 0 };

const directionFor = (axis: "x" | "y", sign: 1 | -1): TvDirection => {
  if (axis === "x") {
    return sign > 0 ? "right" : "left";
  }

  return sign > 0 ? "down" : "up";
};

// Turns a drag (distance from where the finger first touched) into arrow
// presses: one every SWIPE_STEP points along the first dominant axis, so a
// longer swipe scrolls further and reversing direction steps back.
export const nextSwipe = (
  state: ISwipeState,
  dx: number,
  dy: number,
  step: number = SWIPE_STEP,
): { state: ISwipeState; presses: TvDirection[] } => {
  let axis = state.axis;

  if (!axis) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) < AXIS_LOCK_DISTANCE) {
      return { state, presses: [] };
    }

    axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
  }

  const distance = axis === "x" ? dx : dy;
  const target = Math.trunc(distance / step);
  const diff = target - state.emitted;

  if (diff === 0) {
    return { state: { axis, emitted: state.emitted }, presses: [] };
  }

  const direction = directionFor(axis, diff > 0 ? 1 : -1);

  return {
    state: { axis, emitted: target },
    presses: Array.from({ length: Math.abs(diff) }, () => direction),
  };
};

// Holds a drag's progress between gesture updates so the component does not
// need to re-render (or keep a ref) while the finger moves.
export const createSwipeTracker = () => {
  let state = initialSwipeState;

  return {
    reset: () => {
      state = initialSwipeState;
    },
    update: (dx: number, dy: number): TvDirection[] => {
      const result = nextSwipe(state, dx, dy);
      state = result.state;

      return result.presses;
    },
  };
};
