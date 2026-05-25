import type { WasteType } from '../types';

export type WasteQuantityUnit = 'kg' | 'liter';

export function getWasteQuantityUnit(type: WasteType): WasteQuantityUnit {
  return type === 'oil' ? 'liter' : 'kg';
}

export function getWasteQuantityUnitLabel(type: WasteType): string {
  return type === 'oil' ? 'Liter' : 'KG';
}

export function getWasteQuantityLabel(type: WasteType): string {
  return type === 'oil' ? 'Volume' : 'Berat';
}

export function getEstimatedQuantityLabel(type: WasteType): string {
  return type === 'oil' ? 'Estimasi Volume' : 'Estimasi Berat';
}

export function getActualQuantityLabel(type: WasteType): string {
  return type === 'oil' ? 'Volume Aktual' : 'Berat Aktual';
}

export function getPricePerUnitLabel(type: WasteType): string {
  return type === 'oil' ? 'Harga Final / Liter' : 'Harga Final / KG';
}

export function getPriceUnitSuffix(type: WasteType): string {
  return type === 'oil' ? 'liter' : 'kg';
}

export function getUnitSuffix(type: WasteType): string {
  return type === 'oil' ? 'Liter' : 'KG';
}

