import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { PairState } from '../types';
import { Colors, FontSize, Spacing, Radius } from '../theme';
import { formatPrice } from '../utils/format';

interface Props {
  pair:          PairState;
  isFavourite:   boolean;
  onPress:       () => void;
  onToggleFav:   () => void;
}

export function WatchlistRow({ pair, isFavourite, onPress, onToggleFav }: Props) {
  const flash     = useRef(new Animated.Value(0)).current;
  const prevPrice = useRef<number | undefined>(undefined);

  const price     = pair.lastUpdate?.price;
  const direction = pair.priceDirection ?? 'neutral';
  const pct       = pair.priceChangePercent24h ?? 0;
  const isUp      = pct >= 0;

  useEffect(() => {
    if (price === undefined || price === prevPrice.current || direction === 'neutral') {
      prevPrice.current = price;
      return;
    }
    prevPrice.current = price;
    Animated.sequence([
      Animated.timing(flash, { toValue: 1, duration: 80,  useNativeDriver: false }),
      Animated.timing(flash, { toValue: 0, duration: 500, useNativeDriver: false }),
    ]).start();
  }, [price]); // eslint-disable-line react-hooks/exhaustive-deps

  const bg = flash.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      'transparent',
      direction === 'up' ? Colors.positiveGlow : Colors.negativeGlow,
    ],
  });

  const priceColor =
    direction === 'up'   ? Colors.positive :
    direction === 'down' ? Colors.negative :
                           Colors.textPrimary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
      <Animated.View style={[styles.row, { backgroundColor: bg }]}>

        {/* Live dot */}
        <View style={[
          styles.dot,
          { backgroundColor: price !== undefined ? Colors.positive : Colors.textMuted },
        ]} />

        {/* Pair name */}
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{pair.displayName}</Text>
          <Text style={styles.sub}>{pair.status ?? 'LIVE'}</Text>
        </View>

        {/* Price */}
        <Text style={[styles.price, { color: priceColor }]}>
          {price !== undefined ? `$${formatPrice(price)}` : '—'}
        </Text>

        {/* 24h badge */}
        <View style={[
          styles.badge,
          isUp ? styles.badgeUp : styles.badgeDown,
        ]}>
          <Text style={[
            styles.badgeText,
            { color: isUp ? Colors.positive : Colors.negative },
          ]}>
            {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
          </Text>
        </View>

        {/* Star */}
        <TouchableOpacity
          onPress={e => { e.stopPropagation?.(); onToggleFav(); }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.star, isFavourite && styles.starActive]}>
            {isFavourite ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  dot: {
    width:        7,
    height:       7,
    borderRadius: Radius.full,
  },
  nameBlock: { flex: 1 },
  name: {
    fontSize:   FontSize.base,
    fontWeight: '600',
    color:      Colors.textPrimary,
  },
  sub: {
    fontSize:  FontSize.xs,
    color:     Colors.textMuted,
    marginTop: 1,
  },
  price: {
    fontSize:   FontSize.base,
    fontWeight: '600',
    minWidth:   90,
    textAlign:  'right',
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical:   3,
    borderRadius:      Radius.sm,
    minWidth:          72,
    alignItems:        'center',
  },
  badgeUp:   { backgroundColor: Colors.positiveGlow },
  badgeDown: { backgroundColor: Colors.negativeGlow },
  badgeText: {
    fontSize:   FontSize.xs,
    fontWeight: '700',
  },
  star:       { fontSize: 18, color: Colors.textMuted },
  starActive: { color: Colors.warning },
});
