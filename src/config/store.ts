export type ActiveCampaign = null | "dia-dos-pais";

export interface StoreProductAvailability {
  miniSalad: boolean;
  salad: boolean;
  acai: boolean;
  fruitSalad: boolean;
  sandwich: boolean;
}

export interface StoreConfig {
  open: boolean;
  activeCampaign: ActiveCampaign;
  products: StoreProductAvailability;
}

export const STORE_CONFIG: StoreConfig = {
  open: false,
  activeCampaign: null,
  products: {
    miniSalad: false,
    salad: false,
    acai: true,
    fruitSalad: false,
    sandwich: false,
  },
};
