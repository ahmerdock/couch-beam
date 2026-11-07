export const TAB_BAR_HEIGHT = 52;
export const TAB_BAR_MARGIN = 16;

export const getTabBarStyle = (safeAreaBottom: number) => ({
  height: TAB_BAR_HEIGHT + TAB_BAR_MARGIN + safeAreaBottom,
  position: "absolute" as const,
});
