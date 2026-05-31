import { Platform, type ViewStyle } from 'react-native';

export function elevatedCardStyle(): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.02,
      shadowRadius: 2,
    },
    android: { elevation: 0 },
    default: {},
  }) as ViewStyle;
}
