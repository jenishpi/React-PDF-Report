import { invoicePreset } from './invoicePreset';
import { inventoryPreset } from './inventoryPreset';
import { productDataPreset } from './productDataPreset';

export { invoicePreset, inventoryPreset, productDataPreset };

export const PRESETS = [
  invoicePreset,
  inventoryPreset,
  productDataPreset,
];

export function getPresetById(id) {
  return PRESETS.find((p) => p.id === id) || invoicePreset;
}

