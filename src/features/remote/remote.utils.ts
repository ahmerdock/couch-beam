import { diffTextEdit } from "@/lib/tv-remote/text-keys";
import type { ITvSession } from "@/lib/tv-remote/tv-remote.interface";

// Runs one command against the live session. Returns false when there is no
// session or the command throws, so the caller can show the disconnected state.
export const runSessionCommand = (
  session: ITvSession | null,
  command: (session: ITvSession) => void,
): boolean => {
  if (!session) {
    return false;
  }

  try {
    command(session);
    return true;
  } catch {
    return false;
  }
};

// Turns an edit of the search box into the key presses the TV needs:
// backspaces for removed characters, then the newly typed ones.
export const textEditToKeys = (previous: string, next: string): string => {
  const { deleteCount, insert } = diffTextEdit(previous, next);
  return "\b".repeat(deleteCount) + insert;
};
