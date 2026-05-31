export type UnitPreference = 'ml' | 'oz';

export function formatAmount(ml: number, unit: UnitPreference): string {
  if (unit === 'oz') {
    return `${(ml / 29.5735).toFixed(1)} oz`;
  }
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)} L`;
  }
  return `${Math.round(ml)} ml`;
}

export function formatAmountCompact(ml: number, unit: UnitPreference): string {
  if (unit === 'oz') {
    return `${(ml / 29.5735).toFixed(0)}oz`;
  }
  if (ml >= 1000) {
    return `${(ml / 1000).toFixed(1)}L`;
  }
  return `${Math.round(ml)}ml`;
}
