import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePair, useMarket } from '../context/MarketContext';
import { OrderBook }        from '../components/OrderBook';
import { PressureBar }      from '../components/PressureBar';
import { AnimatedPrice }    from '../components/AnimatedPrice';
import { ConnectionBadge }  from '../components/ConnectionBadge';
import { Colors, FontSize, Spacing, Radius } from '../theme';
import { formatPrice, formatSpread, formatTimestamp } from '../utils/format';

interface Props {
  route:      { params: { pair: string } };
  navigation: any;
}

export function MarketDetailScreen({ route, navigation }: Props) {
  const { pair: pairId }                          = route.params;
  const pair                                       = usePair(pairId);
  const { connectionStatus, favourites, toggleFav } = useMarket();

  if (!pair) return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.notFound}>Pair not found</Text>
    </SafeAreaView>
  );

  const update = pair.lastUpdate;
  const pct    = pair.priceChangePercent24h ?? 0;
  const isUp   = pct >= 0;
  const isFav  = favourites.has(pairId);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.topCenter}>
          <Text style={styles.pairTitle}>{pair.displayName}</Text>
          <ConnectionBadge status={connectionStatus} compact />
        </View>

        <TouchableOpacity onPress={() => toggleFav(pairId)} style={styles.favBtn}>
          <Text style={[styles.star, isFav && styles.starActive]}>
            {isFav ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Price header ─────────────────────────────────────────── */}
        <View style={styles.priceHeader}>
          <View style={styles.priceRow}>
            <AnimatedPrice
              price={update?.price}
              direction={pair.priceDirection}
              size="xl"
            />
            <View style={[styles.pctBadge, isUp ? styles.badgeUp : styles.badgeDown]}>
              <Text style={[styles.pct, { color: isUp ? Colors.positive : Colors.negative }]}>
                {isUp ? '▲' : '▼'} {Math.abs(pct).toFixed(2)}%
              </Text>
            </View>
          </View>

          {/* 24h stats */}
          <View style={styles.statsRow}>
            <Stat label="24H HIGH" value={pair.high24h ? `$${formatPrice(pair.high24h)}` : '—'} />
            <View style={styles.statDiv} />
            <Stat label="24H LOW"  value={pair.low24h  ? `$${formatPrice(pair.low24h)}`  : '—'} />
            <View style={styles.statDiv} />
            <Stat label="SPREAD"   value={update ? formatSpread(update.spread) : '—'} />
          </View>
        </View>

        {/* ── Market depth ─────────────────────────────────────────── */}
        {update && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>MARKET DEPTH</Text>
            <PressureBar
              buyPressure={update.buyPressure}
              sellPressure={update.sellPressure}
            />
            <View style={styles.depthRow}>
              <View style={styles.depthItem}>
                <View style={[styles.depthDot, { backgroundColor: Colors.positive }]} />
                <Text style={styles.depthTxt}>
                  Bids: {update.bids.reduce((s, [, q]) => s + parseFloat(q), 0).toFixed(2)} BTC
                </Text>
              </View>
              <View style={styles.liquidityBox}>
                <Text style={styles.liquidityLabel}>LIQUIDITY GAP</Text>
                <Text style={styles.liquidityVal}>
                  {update.spread < 1 ? 'Low' : 'High'} ({formatSpread(update.spread)})
                </Text>
              </View>
              <View style={styles.depthItem}>
                <View style={[styles.depthDot, { backgroundColor: Colors.negative }]} />
                <Text style={styles.depthTxt}>
                  Asks: {update.asks.reduce((s, [, q]) => s + parseFloat(q), 0).toFixed(2)} BTC
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Order book — bids ────────────────────────────────────── */}
        {update && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ORDER BOOK — BIDS</Text>
            <OrderBook levels={update.bids} side="bids" />
          </View>
        )}

        {/* ── Order book — asks ────────────────────────────────────── */}
        {update && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ORDER BOOK — ASKS</Text>
            <OrderBook levels={update.asks} side="asks" />
          </View>
        )}

        {/* ── Footer ───────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerTxt}>
            Last updated:{' '}
            {update ? formatTimestamp(update.timestamp) : 'Waiting for data…'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.bg1 },
  notFound:   { color: Colors.textMuted, textAlign: 'center', marginTop: 80 },
  topBar: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.md,
    backgroundColor:  Colors.bg2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: 56 },
  backArrow: { color: Colors.accent, fontSize: FontSize.lg, fontWeight: '700' },
  backText:  { color: Colors.accent, fontSize: FontSize.base },
  topCenter: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: Spacing.sm,
  },
  pairTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  favBtn:    { minWidth: 36, alignItems: 'flex-end' },
  star:      { fontSize: 22, color: Colors.textMuted },
  starActive:{ color: Colors.warning },
  scroll:    { flex: 1 },
  priceHeader: {
    backgroundColor:  Colors.bg2,
    padding:          Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap:              Spacing.md,
  },
  priceRow:  { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pctBadge:  { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  badgeUp:   { backgroundColor: Colors.positiveGlow },
  badgeDown: { backgroundColor: Colors.negativeGlow },
  pct:       { fontSize: FontSize.md, fontWeight: '700' },
  statsRow:  { flexDirection: 'row', alignItems: 'center' },
  statDiv:   { width: 1, height: 30, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.4, marginBottom: 2 },
  statValue: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '600' },
  card: {
    backgroundColor:  Colors.bg2,
    marginTop:        8,
    padding:          Spacing.lg,
    gap:              Spacing.md,
    borderTopWidth:   1,
    borderBottomWidth: 1,
    borderColor:      Colors.border,
  },
  cardTitle: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  depthRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  depthItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  depthDot:  { width: 8, height: 8, borderRadius: 4 },
  depthTxt:  { fontSize: FontSize.xs, color: Colors.textSecondary },
  liquidityBox: {
    alignItems:       'center',
    borderWidth:      1,
    borderColor:      Colors.border,
    borderRadius:     Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   Spacing.xs,
  },
  liquidityLabel: { fontSize: 9, color: Colors.textMuted, letterSpacing: 0.4 },
  liquidityVal:   { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: '600' },
  footer:    { alignItems: 'center', paddingVertical: Spacing.xl },
  footerTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
});
