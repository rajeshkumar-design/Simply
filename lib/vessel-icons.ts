import type { MaterialCommunityIconName } from '@/components/ui/MIcon';

/**
 * Catalog of selectable vessel icons. The `key` is what we persist in the
 * Container.emoji field (repurposed to store an icon key instead of an emoji).
 */
export interface VesselIcon {
  key: string;
  icon: MaterialCommunityIconName;
  label: string;
}

export const VESSEL_ICONS: VesselIcon[] = [
  { key: 'glass', icon: 'cup-water', label: 'Glass' },
  { key: 'cup', icon: 'cup', label: 'Cup' },
  { key: 'mug', icon: 'coffee', label: 'Mug' },
  { key: 'bottle', icon: 'bottle-soda', label: 'Bottle' },
  { key: 'tonic', icon: 'bottle-tonic', label: 'Flask' },
  { key: 'pitcher', icon: 'kettle', label: 'Pitcher' },
  { key: 'sports', icon: 'bottle-tonic-plus', label: 'Sports' },
  { key: 'tea', icon: 'tea', label: 'Tea' },
];

const DEFAULT_ICON: MaterialCommunityIconName = 'cup-water';

/**
 * Resolve a persisted vessel key (or legacy emoji) to a MaterialCommunityIcons name.
 * Legacy emoji values fall back to the default glass icon.
 */
export function resolveVesselIcon(key: string | undefined): MaterialCommunityIconName {
  if (!key) return DEFAULT_ICON;
  const found = VESSEL_ICONS.find((v) => v.key === key);
  return found ? found.icon : DEFAULT_ICON;
}
