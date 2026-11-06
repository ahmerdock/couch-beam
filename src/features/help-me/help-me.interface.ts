export interface IHelpMeProductDetails {
  id: string;
  displayPrice: string;
}

export interface IUseHelpMeReturn {
  expandedId: string | null;
  toggleEntry: (id: string) => void;
  isAvailable: boolean;
  isProductsLoading: boolean;
  productsById: Record<string, IHelpMeProductDetails | undefined>;
  purchasingProductId: string | null;
  purchase: (productId: string) => Promise<void>;
}
