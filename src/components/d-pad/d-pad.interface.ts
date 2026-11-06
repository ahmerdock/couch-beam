import type { TvDirection } from "@/lib/tv-remote/tv-remote.interface";

export interface IDPadProps {
  onPress: (direction: TvDirection) => void;
  disabled?: boolean;
}
