const ACTION_MAP: Record<number, string> = {
  1: "Add",
  2: "Update",
  4: "Remove",
};

const SIDE_MAP: Record<number, string> = {
  1: "Buy",
  2: "Sell",
};

export const formatAction = (action: number): string =>
  ACTION_MAP[action] ?? String(action);

export const formatSide = (side: number): string =>
  SIDE_MAP[side] ?? "Unknown";

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

export const formatQuantity = (qty: number): string => qty?.toFixed(6);
