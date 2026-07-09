import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ConnectionStatus } from '../types';
import { Colors, FontSize, Radius, Spacing } from '../theme';

const CFG: Record<ConnectionStatus, { label: string; color: string }> = {
  connected:    { label: 'CONNECTED',    color: Colors.positive },
  connecting:   { label: 'CONNECTING',   color: Colors.warning  },
  reconnecting: { label: 'RECONNECTING', color: Colors.warning  },
  disconnected: { label: 'DISCONNECTED', color: Colors.negative },
};

interface Props {
  status:   ConnectionStatus;
  compact?: boolean;
}

export function ConnectionBadge({ status, compact = false }: Props) {
  const { label, color } = CFG[status];
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      {!compact && (
        <Text style={[styles.label, { color }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.xs,
    backgroundColor:  'rgba(0,0,0,0.3)',
    paddingHorizontal: Spacing.sm,
    paddingVertical:   Spacing.xs,
    borderRadius:      Radius.full,
    borderWidth:       1,
    borderColor:       Colors.border,
  },
  dot: {
    width:        7,
    height:       7,
    borderRadius: Radius.full,
  },
  label: {
    fontSize:    FontSize.xs,
    fontWeight:  '600',
    letterSpacing: 0.8,
  },
});
