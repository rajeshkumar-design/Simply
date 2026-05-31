import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';
import type { ComponentProps } from 'react';

export type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];
export type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface MIconProps {
  name: MaterialIconName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

export function MIcon({ name, size = 24, color, style }: MIconProps) {
  return <MaterialIcons name={name} size={size} color={color} style={style} />;
}

interface MCIconProps {
  name: MaterialCommunityIconName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

export function MCIcon({ name, size = 24, color, style }: MCIconProps) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}
