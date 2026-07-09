import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSize, Spacing, Radius } from '../theme';

interface Props {
  buyPressure:  number; // 0–100
  sellPressure: number; // 0–100
}

export function PressureBar({ buyPressure, sellPressure }: Props) {
  const anim = useRef(new Animated.Value(buyPressure)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue:  buyPressure,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [buyPressure]); // eslint-disable-line react-hooks/exhaustive-deps

  const buyWidth = anim.interpolate({
    inputRange:  [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const dominantBuy   = buyPressure > sellPressure;
  const dominanceText = dominantBuy ? 'Buy Heavy' : 'Sell Heavy';
  const dominanceColor = dominantBuy ? Colors.positive : Colors.negative;

  return (
    <View style={styles.container}>
      <View style={styles.labels}>
        <Text style={[styles.label, { color: Colors.positive }]}>
          BUY {buyPressure}%
        </Text>
        <Text style={[styles.pressure, { color: dominanceColor }]}>
          {dominanceText}
        </Text>
        <Text style={[styles.label, { color: Colors.negative }]}>
          SELL {sellPressure}%
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.buyFill, { width: buyWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.xs },
  labels: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  label:    { fontSize: FontSize.sm, fontWeight: '700' },
  pressure: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.4 },
  track: {
    height:          6,
    backgroundColor: Colors.negative + '44',
    borderRadius:    Radius.full,
    overflow:        'hidden',
  },
  buyFill: {
    height:          '100%',
    backgroundColor: Colors.positive,
    borderRadius:    Radius.full,
  },
});
