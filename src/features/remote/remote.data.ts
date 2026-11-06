import Clapperboard from "lucide-react-native/icons/clapperboard";
import MonitorPlay from "lucide-react-native/icons/monitor-play";
import Play from "lucide-react-native/icons/play";

export const APP_SHORTCUTS = [
  {
    id: "youtube",
    label: "YouTube",
    icon: Play,
    appLink: "https://www.youtube.com",
  },
  {
    id: "netflix",
    label: "Netflix",
    icon: Clapperboard,
    appLink: "https://www.netflix.com",
  },
  {
    id: "prime-video",
    label: "Prime Video",
    icon: MonitorPlay,
    appLink: "https://www.primevideo.com",
  },
] as const;

export const PAD_MODES = [
  { id: "dpad", label: "D-pad" },
  { id: "touchpad", label: "Touchpad" },
] as const;
