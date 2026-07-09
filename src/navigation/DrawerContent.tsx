import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, type DrawerContentComponentProps } from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMarket } from '../context/MarketContext';
import { Colors, FontSize, Spacing, Radius } from '../theme';

const ACCOUNT_ITEMS = [
  { icon: '🔑', label: 'API Keys',  screen: 'AccountDrawer' },
  { icon: '🛡',  label: 'Security', screen: 'AccountDrawer' },
];

const TRADING_ITEMS = [
  { icon: '↺', label: 'Trade History', screen: 'AccountDrawer', active: true },
  { icon: '❓', label: 'Support',       screen: 'AccountDrawer', active: false },
];

export function DrawerContent(props: DrawerContentComponentProps) {
  const { connectionStatus } = useMarket();
  const isLive = connectionStatus === 'connected';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>

      {/* Profile */}
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>PT</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>Pro Trader</Text>
          <Text style={styles.tier}>Tier 3 Verified • ID: 882941</Text>
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: Spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Home */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.item}
            onPress={() => props.navigation.navigate('Main')}
          >
            <Text style={styles.icon}>🏠</Text>
            <Text style={styles.itemLabel}>Home</Text>
          </TouchableOpacity>
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          {ACCOUNT_ITEMS.map(item => (
            <TouchableOpacity
              key={item.label}
              style={styles.item}
              onPress={() => props.navigation.navigate(item.screen)}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.itemLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trading section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TRADING</Text>
          {TRADING_ITEMS.map(item => (
            <TouchableOpacity
              key={item.label}
              style={[styles.item, item.active && styles.itemActive]}
              onPress={() => props.navigation.navigate(item.screen)}
            >
              <Text style={[styles.icon, item.active && { color: Colors.accent }]}>
                {item.icon}
              </Text>
              <Text style={[styles.itemLabel, item.active && styles.itemLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Footer — connection + sign out */}
      <View style={styles.footer}>
        <View style={styles.connRow}>
          <View style={[styles.connDot, { backgroundColor: isLive ? Colors.positive : Colors.negative }]} />
          <Text style={[styles.connText, { color: isLive ? Colors.positive : Colors.negative }]}>
            {isLive ? 'CONNECTED' : 'DISCONNECTED'}
          </Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.drawerBg },
  profile: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.md,
    padding:          Spacing.xl,
    backgroundColor:  Colors.bg2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 48, height: 48,
    borderRadius:    Radius.full,
    backgroundColor: Colors.accent + '33',
    borderWidth:     2,
    borderColor:     Colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.accent },
  name:  { fontSize: FontSize.base, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  tier:  { fontSize: FontSize.xs,  color: Colors.textSecondary },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sectionLabel: {
    fontSize: FontSize.xs, color: Colors.textMuted,
    fontWeight: '700', letterSpacing: 1,
    paddingVertical: Spacing.sm, paddingLeft: Spacing.sm,
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderRadius: Radius.md, gap: Spacing.md,
  },
  itemActive: { backgroundColor: Colors.drawerActive },
  icon:       { fontSize: 16, width: 24, color: Colors.textSecondary, textAlign: 'center' },
  itemLabel:  { fontSize: FontSize.base, color: Colors.drawerText, fontWeight: '500' },
  itemLabelActive: { color: Colors.accent, fontWeight: '600' },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1, borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  connRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  connDot: { width: 7, height: 7, borderRadius: Radius.full },
  connText: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.6 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md,
    borderRadius: Radius.md, backgroundColor: Colors.bg2,
    borderWidth: 1, borderColor: Colors.border,
  },
  signOutText: { fontSize: FontSize.base, color: Colors.negative, fontWeight: '500' },
});
