import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import type { PriceLevel } from '../types';
import { Colors, FontSize, Spacing } from '../theme';
import { formatPrice } from '../utils/format';

interface Props {
  bids:   PriceLevel[]; // sorted desc by price, best bid first
  asks:   PriceLevel[]; // sorted asc by price, best ask first
  height?: number;
}

const VB_W = 300;
const VB_H = 100;

function cumulate(levels: PriceLevel[]) {
  let cum = 0;
  return levels.map(([price, qty]) => {
    cum += parseFloat(qty);
    return { price: parseFloat(price), cum };
  });
}

// Builds a smoothly curved area path radiating out from the center baseline.
function curveAreaPath(points: { x: number; y: number }[], side: 'left' | 'right') {
  if (points.length === 0) return '';
  const centerX = VB_W / 2;
  const lastX   = side === 'left' ? 0 : VB_W;

  let d = `M ${centerX} ${VB_H} L ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const midX = (points[i - 1].x + points[i].x) / 2;
    const midY = (points[i - 1].y + points[i].y) / 2;
    d += ` Q ${points[i - 1].x} ${points[i - 1].y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y} L ${lastX} ${last.y} L ${lastX} ${VB_H} Z`;
  return d;
}

export function DepthChart({ bids, asks, height = 120 }: Props) {
  const bidLevels = cumulate(bids);
  const askLevels = cumulate(asks);

  const maxCum = Math.max(
    bidLevels[bidLevels.length - 1]?.cum ?? 0,
    askLevels[askLevels.length - 1]?.cum ?? 0,
    1,
  );

  const centerX = VB_W / 2;
  const halfW   = VB_W / 2;
  const topPad  = VB_H * 0.1;

  const yFor = (cum: number) => VB_H - topPad - (cum / maxCum) * (VB_H - topPad);

  const bidPoints = bidLevels.map((l, i) => ({
    x: centerX - (bidLevels.length > 1 ? (i / (bidLevels.length - 1)) * halfW : 0),
    y: yFor(l.cum),
  }));
  const askPoints = askLevels.map((l, i) => ({
    x: centerX + (askLevels.length > 1 ? (i / (askLevels.length - 1)) * halfW : 0),
    y: yFor(l.cum),
  }));

  const bidPath = curveAreaPath(bidPoints, 'left');
  const askPath = curveAreaPath(askPoints, 'right');

  const bestBid = bids[0]?.[0];
  const bestAsk = asks[0]?.[0];
  const lowBid  = bids[bids.length - 1]?.[0];
  const highAsk = asks[asks.length - 1]?.[0];

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
        <Line
          x1={centerX} x2={centerX} y1={0} y2={VB_H}
          stroke={Colors.border} strokeWidth={1} strokeDasharray="3,3"
        />
        {bidPath && (
          <Path d={bidPath} fill={Colors.positive + '33'} stroke={Colors.bg2} strokeWidth={1.5} />
        )}
        {askPath && (
          <Path d={askPath} fill={Colors.negative + '33'} stroke={Colors.bg2} strokeWidth={1.5} />
        )}
      </Svg>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: Colors.positive }]}>
          {lowBid ? `$${formatPrice(parseFloat(lowBid))}` : '—'}
        </Text>
        <Text style={styles.labelMid}>
          {bestBid && bestAsk ? `$${formatPrice(parseFloat(bestBid))} · $${formatPrice(parseFloat(bestAsk))}` : '—'}
        </Text>
        <Text style={[styles.label, { color: Colors.negative }]}>
          {highAsk ? `$${formatPrice(parseFloat(highAsk))}` : '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  labelRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  label:    { fontSize: FontSize.xs, fontWeight: '700' },
  labelMid: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600' },
});
