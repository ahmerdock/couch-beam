import Coffee from "lucide-react-native/icons/coffee";
import Hamburger from "lucide-react-native/icons/hamburger";
import Rocket from "lucide-react-native/icons/rocket";

export const HELP_ME_PRODUCT_IDS = {
  COFFEE: "tip_coffee",
  LUNCH: "tip_lunch",
  FEATURE: "tip_feature",
} as const;

export const HELP_ME_PRODUCTS = [
  {
    id: HELP_ME_PRODUCT_IDS.COFFEE,
    label: "Buy me a coffee",
    description: "A small thank you ☕",
    icon: Coffee,
    successMessage: "Thank you for the coffee! ☕",
  },
  {
    id: HELP_ME_PRODUCT_IDS.LUNCH,
    label: "Buy me lunch",
    description: "A generous treat 🍔",
    icon: Hamburger,
    successMessage: "Thank you for lunch! 🍔",
  },
  {
    id: HELP_ME_PRODUCT_IDS.FEATURE,
    label: "Sponsor a feature",
    description: "Help build the next big thing 🚀",
    icon: Rocket,
    successMessage: "Thank you for sponsoring a feature! 🚀",
  },
] as const;

export const TROUBLESHOOTING_ENTRIES = [
  {
    id: "not-discovered",
    title: "My TV isn't found",
    answer:
      "Make sure the TV is on and on the same Wi-Fi as your phone, not a guest network. Then tap Scan again in the pairing sheet. If it still doesn't show up, restart the TV.",
  },
  {
    id: "pairing-fails",
    title: "Pairing fails or no code appears",
    answer:
      "The code can take a moment, and the first attempt sometimes shows nothing. Close the sheet and try again. Check the code carefully: it uses the digits 0-9 and letters A-F.",
  },
  {
    id: "commands-not-reaching",
    title: "Buttons do nothing",
    answer:
      "Open the Remote tab and tap Reconnect if you see the unreachable message. Make sure the TV is awake, and that its remote service has not been turned off after a software update.",
  },
] as const;
