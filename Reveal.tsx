import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

// Native stub: no scroll-reveal, just render children.
export function Reveal({ children, style }: { children: React.ReactNode; delay?: number; y?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={style}>{children}</View>;
}
