export interface ITextSegment {
  kind: "insert" | "delete";
  text: string;
}

// "\b" stands for one backspace. Consecutive characters of the same kind merge
// into one segment, so a burst of typing becomes a single text injection.
export const splitTextEdit = (edit: string): ITextSegment[] => {
  const segments: ITextSegment[] = [];

  for (const character of Array.from(edit)) {
    const kind = character === "\b" ? "delete" : "insert";
    const last = segments[segments.length - 1];

    if (last && last.kind === kind) {
      last.text += character;
    } else {
      segments.push({ kind, text: character });
    }
  }

  return segments;
};

// Length of the common prefix, so a text field edit becomes backspaces + new text.
export const diffTextEdit = (previous: string, next: string) => {
  let shared = 0;

  while (
    shared < previous.length &&
    shared < next.length &&
    previous[shared] === next[shared]
  ) {
    shared += 1;
  }

  return { deleteCount: previous.length - shared, insert: next.slice(shared) };
};
