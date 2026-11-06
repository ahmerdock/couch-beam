import Globe from "lucide-react-native/icons/globe";
import { GithubIcon, LinkedinIcon } from "@/assets/icon";

export const CONTACT_LINKS = [
  {
    label: "GitHub",
    description: "@ahmerdock",
    icon: GithubIcon,
    url: "https://github.com/ahmerdock",
  },
  {
    label: "LinkedIn",
    description: "Connect with me",
    icon: LinkedinIcon,
    url: "https://linkedin.com/in/ahmerdock",
  },
  {
    label: "Portfolio",
    description: "ahmerdock.com",
    icon: Globe,
    url: "https://ahmerdock.com",
  },
] as const;
