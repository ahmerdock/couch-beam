export interface IUseSettingsReturn {
  isDark: boolean;
  toggleTheme: () => void;
  openLink: (url: string) => Promise<void>;
}
