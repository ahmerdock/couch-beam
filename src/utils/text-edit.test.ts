import { diffTextEdit, splitTextEdit } from "./text-edit";

describe("text edits", () => {
  it("merges typed characters and backspaces into segments", () => {
    expect(splitTextEdit("ab\b\bc")).toEqual([
      { kind: "insert", text: "ab" },
      { kind: "delete", text: "\b\b" },
      { kind: "insert", text: "c" },
    ]);
  });

  it("diffs an edit into deletions and an insertion", () => {
    expect(diffTextEdit("abc", "abd")).toEqual({ deleteCount: 1, insert: "d" });
  });
});
