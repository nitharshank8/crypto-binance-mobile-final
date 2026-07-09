import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useMarket }    from '../context/MarketContext';
import { Colors, FontSize, Spacing, Radius } from '../theme';

const INTERVALS = [10, 50, 100, 250, 500, 1000];

export function TelemetryScreen() {
  const navigation = useNavigation();
  const { connectionStatus, wsServiceRef, pairs } = useMarket();
  const [intervalMs,      setIntervalMs]      = useState(250);
  const [compression,     setCompression]     = useState(true);
  const [adaptivePolling, setAdaptivePolling] = useState(false);

  const isLive    = connectionStatus === 'connected';
  const liveCount = pairs.filter(p => p.lastUpdate !== undefined).length;
  const memMb     = (liveCount * 42.5 + 8).toFixed(1);

  const handleInterval = (val: number) => {
    setIntervalMs(val);
    wsServiceRef.current?.sendInterval(val);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>BTC/USDT</Text>
            <Text style={styles.headerTitle}>System Settings{'\n'}&amp; Telemetry</Text>
            <Text style={styles.headerDesc}>
              Real-time performance monitoring and data ingestion controls.
            </Text>
          </View>
          <View style={[styles.liveBadge, { borderColor: isLive ? Colors.positive : Colors.negative }]}>
            <View style={[styles.liveDot, { backgroundColor: isLive ? Colors.positive : Colors.negative }]} />
            <Text style={[styles.liveText, { color: isLive ? Colors.positive : Colors.negative }]}>
              {isLive ? 'LIVE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        {/* ── Network control ────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NETWORK CONTROL</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>Data Throttling Configurator</Text>
              <Text style={styles.cardValue}>{intervalMs}ms</Text>
            </View>

            {/* Interval buttons */}
            <View style={styles.intervalRow}>
              {INTERVALS.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.iBtn, intervalMs === opt && styles.iBtnActive]}
                  onPress={() => handleInterval(opt)}
                >
                  <Text style={[styles.iBtnText, intervalMs === opt && styles.iBtnTextActive]}>
                    {opt < 1000 ? `${opt}ms` : '1s'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeTxt}>10ms</Text>
              <Text style={styles.rangeTxt}>500ms</Text>
              <Text style={styles.rangeTxt}>1000ms</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Binary Protocol Compression</Text>
              <Switch
                value={compression}
                onValueChange={setCompression}
                trackColor={{ false: Colors.bg3, true: Colors.accent + '88' }}
                thumbColor={compression ? Colors.accent : Colors.textMuted}
              />
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Adaptive Polling Strategy</Text>
              <Switch
                value={adaptivePolling}
                onValueChange={setAdaptivePolling}
                trackColor={{ false: Colors.bg3, true: Colors.accent + '88' }}
                thumbColor={adaptivePolling ? Colors.accent : Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* ── Performance dashboard ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SYSTEM TELEMETRY</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>Performance Dashboard</Text>
              <View style={styles.statusRow}>
                <TouchableOpacity style={styles.resetBtn}>
                  <Text style={styles.resetTxt}>RESET</Text>
                </TouchableOpacity>
                <View style={[
                  styles.healthBadge,
                  { backgroundColor: isLive ? Colors.positiveGlow : Colors.negativeGlow },
                ]}>
                  <Text style={[styles.healthTxt, { color: isLive ? Colors.positive : Colors.negative }]}>
                    {isLive ? 'HEALTHY' : 'DEGRADED'}
                  </Text>
                </View>
              </View>
            </View>

            {/* FPS circle */}
            <View style={styles.metricCenter}>
              <View style={styles.fpsCircle}>
                <Text style={styles.fpsVal}>60</Text>
                <Text style={styles.fpsUnit}>FPS</Text>
              </View>
              <Text style={styles.metricLabel}>JS Thread Frame Rate</Text>
            </View>

            <View style={styles.divider} />

            {/* WS ingestion */}
            <View style={styles.metricHRow}>
              <View style={styles.metricLeft}>
                <Text style={styles.metricIcon}>⊞</Text>
                <View>
                  <Text style={styles.metricBig}>{liveCount * 5}</Text>
                  <Text style={styles.metricUnit}>msgs/sec</Text>
                </View>
              </View>
              <Text style={styles.metricRight}>WS Message Ingestion Rate</Text>
            </View>

            <View style={styles.divider} />

            {/* Memory */}
            <View style={styles.memRow}>
              <Text style={styles.memLabel}>Memory Footprint Tracker</Text>
              <Text style={styles.memVal}>{memMb} MB</Text>
            </View>
            <View style={styles.memTrack}>
              <View style={[
                styles.memFill,
                { width: `${Math.min((parseFloat(memMb) / 200) * 100, 100)}%` },
              ]} />
            </View>
          </View>
        </View>

        {/* ── Status cards ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <InfoCard icon="⚡" color={Colors.accent}         label="GPU ACCELERATION" value="WebGL Render Pipeline: Active" />
          <InfoCard icon="🛡" color={Colors.negative}       label="API LATENCY"      value={isLive ? 'Avg Ping: 14ms (London-1)' : 'Backend Unreachable'} />
          <InfoCard icon="💾" color={Colors.textSecondary}  label="STORAGE CACHE"    value="IndexedDB: 1.2GB utilized" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function InfoCard({
  icon, color, label, value,
}: { icon: string; color: string; label: string; value: string }) {
  return (
    <View style={ic.card}>
      <View style={[ic.iconBox, { backgroundColor: color + '22' }]}>
        <Text style={ic.icon}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[ic.label, { color }]}>{label}</Text>
        <Text style={ic.value}>{value}</Text>
      </View>
    </View>
  );
}

const ic = StyleSheet.create({
  card: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  Colors.bg2,
    borderRadius:     Radius.md,
    marginBottom:     Spacing.sm,
    padding:          Spacing.md,
    gap:              Spacing.md,
    borderWidth:      1,
    borderColor:      Colors.border,
  },
  iconBox: {
    width: 40, height: 40,
    borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  icon:  { fontSize: 18 },
  label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  value: { fontSize: FontSize.sm, color: Colors.textSecondary },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg1 },
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'flex-start',
    padding:          Spacing.xl,
    backgroundColor:  Colors.bg2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuBtn:     { padding: 2, marginRight: Spacing.sm, marginTop: 2 },
  menuIcon:    { fontSize: 20, color: Colors.textPrimary },
  headerSub:   { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: 2 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  headerDesc:  { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  liveBadge: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              4,
    paddingHorizontal: Spacing.sm,
    paddingVertical:   Spacing.xs,
    borderRadius:     Radius.sm,
    borderWidth:      1,
    backgroundColor:  Colors.bg1,
    marginLeft:       Spacing.md,
    alignSelf:        'flex-start',
  },
  liveDot:  { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.4 },
  section:  { padding: Spacing.lg, gap: Spacing.sm },
  sectionLabel: {
    fontSize: FontSize.xs, color: Colors.accent,
    fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.bg2,
    borderRadius:    Radius.lg,
    padding:         Spacing.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
    gap:             Spacing.md,
  },
  cardRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  cardValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.accent },
  intervalRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  iBtn: {
    flex: 1, paddingVertical: Spacing.sm,
    borderRadius: Radius.sm, backgroundColor: Colors.bg3,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border, minWidth: 44,
  },
  iBtnActive:     { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  iBtnText:       { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
  iBtnTextActive: { color: Colors.accent, fontWeight: '700' },
  rangeRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  rangeTxt:   { fontSize: FontSize.xs, color: Colors.textMuted },
  divider:    { height: 1, backgroundColor: Colors.borderSubtle },
  toggleRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  toggleLabel:{ fontSize: FontSize.base, color: Colors.textSecondary, flex: 1 },
  statusRow:  { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  resetBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs,
    borderRadius: Radius.sm, backgroundColor: Colors.bg3,
    borderWidth: 1, borderColor: Colors.border,
  },
  resetTxt:   { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: '700', letterSpacing: 0.4 },
  healthBadge:{ paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: Radius.sm },
  healthTxt:  { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.4 },
  metricCenter: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  fpsCircle: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 4, borderColor: Colors.accent,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.bg1,
  },
  fpsVal:     { fontSize: FontSize.xxxl, fontWeight: '700', color: Colors.textPrimary },
  fpsUnit:    { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1 },
  metricLabel:{ fontSize: FontSize.sm, color: Colors.textSecondary },
  metricHRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metricLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  metricIcon: { fontSize: 24, color: Colors.textMuted },
  metricBig:  { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  metricUnit: { fontSize: FontSize.xs, color: Colors.textMuted },
  metricRight:{ fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1, textAlign: 'right' },
  memRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memLabel:{ fontSize: FontSize.sm, color: Colors.textSecondary },
  memVal:  { fontSize: FontSize.sm, color: Colors.negative, fontWeight: '600' },
  memTrack:{ height: 40, backgroundColor: Colors.bg3, borderRadius: Radius.sm, overflow: 'hidden' },
  memFill: { height: '100%', backgroundColor: Colors.negative + '44', borderRadius: Radius.sm },
});
