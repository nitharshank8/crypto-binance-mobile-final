import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useMarket } from '../context/MarketContext';
import { Colors, FontSize, Spacing, Radius } from '../theme';

export function AccountScreen() {
  const navigation = useNavigation();
  const { favourites } = useMarket();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>PT</Text>
          </View>
          <View>
            <Text style={styles.name}>Pro Trader</Text>
            <Text style={styles.tier}>
              Tier 3 Verified • <Text style={{ color: Colors.positive }}>ID: 882941</Text>
            </Text>
          </View>
        </View>

        {/* Account */}
        <Section label="ACCOUNT">
          <MenuItem icon="🔑" title="API Keys"  sub="Manage your API credentials" />
          <Divider />
          <MenuItem icon="🛡" title="Security"  sub="Two-factor authentication" />
        </Section>

        {/* Trading */}
        <Section label="TRADING">
          <MenuItem icon="↺" title="Trade History" sub="View past trades" active />
          <Divider />
          <MenuItem icon="⭐" title="Favourites" sub={`${favourites.size} pairs favourited`} />
        </Section>

        {/* Help */}
        <Section label="HELP">
          <MenuItem icon="❓" title="Support" sub="Get help and documentation" />
        </Section>

        {/* Sign out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutBtn}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function MenuItem({
  icon, title, sub, active = false,
}: { icon: string; title: string; sub: string; active?: boolean }) {
  return (
    <TouchableOpacity style={[styles.item, active && styles.itemActive]}>
      <View style={styles.itemIcon}>
        <Text>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.itemTitle, active && styles.itemTitleActive]}>{title}</Text>
        <Text style={styles.itemSub}>{sub}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg1 },
  profileHeader: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              Spacing.lg,
    padding:          Spacing.xl,
    backgroundColor:  Colors.bg2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 56, height: 56,
    borderRadius:    Radius.full,
    backgroundColor: Colors.accent + '33',
    borderWidth:     2,
    borderColor:     Colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuBtn:    { padding: 2, marginRight: -4 },
  menuIcon:   { fontSize: 20, color: Colors.textPrimary },
  avatarText: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.accent },
  name:       { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  tier:       { fontSize: FontSize.sm, color: Colors.textSecondary },
  section:    { padding: Spacing.lg, gap: Spacing.sm },
  sectionLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  card:       { backgroundColor: Colors.bg2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  divider:    { height: 1, backgroundColor: Colors.borderSubtle, marginLeft: Spacing.lg + 36 + Spacing.md },
  item:       { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  itemActive: { backgroundColor: Colors.accentDim },
  itemIcon:   { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.bg3, alignItems: 'center', justifyContent: 'center' },
  itemTitle:  { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  itemTitleActive: { color: Colors.accent },
  itemSub:    { fontSize: FontSize.sm, color: Colors.textSecondary },
  chevron:    { fontSize: 22, color: Colors.textMuted },
  signOutBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: Colors.bg2,
    borderRadius:    Radius.lg,
    padding:         Spacing.lg,
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  signOutText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.negative },
});
