export interface ProductVariant {
  size?: string;
  color?: string;
  [key: string]: string | undefined;
}

export interface BundleProduct {
  product_id: string;
  product_nom: string;
  product_prix: number;
  bundle_prix: number; // Discounted price when in bundle
  media?: any[];
  variables?: ProductVariant;
  en_stock: boolean;
  available_variants?: {
    sizes?: string[];
    colors?: string[];
  };
}

export interface BundleOffer {
  id: string;
  name: string;
  primary_product: BundleProduct;
  secondary_product: BundleProduct;
  discount_percentage: number;
  description: string;
  is_active: boolean;
  min_quantity?: number;
  max_quantity?: number;
  valid_until?: Date;
}

export interface CartBundle {
  bundle_id: string;
  bundle_name: string;
  primary_item: {
    product_id: string;
    product_nom: string;
    product_prix: number;
    quantite: number;
    variables?: ProductVariant;
    media?: any[];
  };
  secondary_item: {
    product_id: string;
    product_nom: string;
    original_prix: number;
    bundle_prix: number;
    quantite: number;
    variables?: ProductVariant;
    media?: any[];
  };
  total_savings: number;
  original_total: number;
  bundle_total: number;
}