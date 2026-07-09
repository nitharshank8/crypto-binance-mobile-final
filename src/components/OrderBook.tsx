import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import type { PriceLevel } from '../types';
import { Colors, FontSize, Spacing } from '../theme';

interface Props {
  levels:    PriceLevel[];
  side:      'bids' | 'asks';
  maxTotal?: number;
}

function Row({
  level,
  side,
  fillPercent,
}: {
  level:       PriceLevel;
  side:        'bids' | 'asks';
  fillPercent: number;
}) {
  const fill = useRef(new Animated.Value(fillPercent)).current;

  useEffect(() => {
    Animated.timing(fill, {
      toValue:  fillPercent,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [fillPercent]); // eslint-disable-line react-hooks/exhaustive-deps

  const fillWidth = fill.interpolate({
    inputRange:  [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const isBid       = side === 'bids';
  const fillColor   = isBid ? Colors.positiveGlow : Colors.negativeGlow;
  const priceColor  = isBid ? Colors.positive     : Colors.negative;
  const [price, qty] = level;
  const total = (parseFloat(price) * parseFloat(qty)).toFixed(2);

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width:            fillWidth,
            [isBid ? 'right' : 'left']: 0,
          },
        ]}
      />
      <Text style={[styles.cell, { color: priceColor }]}>
        {parseFloat(price).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Text>
      <Text style={[styles.cell, styles.right, { color: Colors.textSecondary }]}>
        {parseFloat(qty).toFixed(5)}
      </Text>
      <Text style={[styles.cell, styles.right, { color: Colors.textSecondary }]}>
        {parseFloat(total).toLocaleString()}
      </Text>
    </View>
  );
}

export function OrderBook({ levels, side, maxTotal }: Props) {
  const totals = levels.map(([p, q]) => parseFloat(p) * parseFloat(q));
  const max    = maxTotal ?? Math.max(...totals, 1);

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.headerCell}>PRICE (USDT)</Text>
        <Text style={[styles.headerCell, styles.right]}>AMOUNT</Text>
        <Text style={[styles.headerCell, styles.right]}>TOTAL</Text>
      </View>
      {levels.map((level, i) => (
        <Row
          key={`${side}-${level[0]}`}
          level={level}
          side={side}
          fillPercent={(totals[i] / max) * 100}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection:     'row',
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCell: {
    flex:          1,
    fontSize:      FontSize.xs,
    color:         Colors.textMuted,
    fontWeight:    '600',
    letterSpacing: 0.4,
  },
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing.md,
    paddingVertical:   5,
    position:          'relative',
    overflow:          'hidden',
  },
  fill: {
    position: 'absolute',
    top:      0,
    bottom:   0,
    opacity:  0.65,
  },
  cell: {
    flex:      1,
    fontSize:  FontSize.sm,
    fontWeight: '500',
  },
  right: { textAlign: 'right' },
});
