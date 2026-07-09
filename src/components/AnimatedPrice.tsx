import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../theme';
import { formatPrice } from '../utils/format';

interface Props {
  price?:     number;
  direction?: 'up' | 'down' | 'neutral';
  size?:      'sm' | 'md' | 'lg' | 'xl';
  style?:     object;
}

const SIZE: Record<NonNullable<Props['size']>, number> = {
  sm: FontSize.sm,
  md: FontSize.base,
  lg: FontSize.xl,
  xl: FontSize.xxxl,
};

export function AnimatedPrice({
  price,
  direction = 'neutral',
  size = 'md',
  style,
}: Props) {
  const flash = useRef(new Animated.Value(0)).current;
  const prevPrice = useRef<number | undefined>(undefined);

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
      'rgba(0,0,0,0)',
      direction === 'up' ? 'rgba(0,200,150,0.22)' : 'rgba(255,77,106,0.22)',
    ],
  });

  const color =
    direction === 'up'   ? Colors.positive :
    direction === 'down' ? Colors.negative :
                           Colors.textPrimary;

  return (
    <Animated.View style={[styles.wrap, { backgroundColor: bg }]}>
      <Text style={[styles.text, { fontSize: SIZE[size], color }, style]}>
        {price !== undefined ? `$${formatPrice(price)}` : '—'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 4, paddingHorizontal: 3, paddingVertical: 1 },
  text: { fontWeight: '600' },
});
