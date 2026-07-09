import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { useMarket } from '../context/MarketContext';
import { WatchlistRow } from '../components/WatchlistRow';
import { ConnectionBadge } from '../components/ConnectionBadge';
import type { PairState } from '../types';
import { Colors, FontSize, Spacing, Radius } from '../theme';

interface Props { navigation: any }

export function MarketsScreen({ navigation }: Props) {
  const { pairs, connectionStatus, favourites, toggleFav, isRefreshing, refreshMeta } = useMarket();
  const [query,     setQuery]     = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'favourites'>('all');

  const filtered = useMemo(() => {
    let list = activeTab === 'favourites'
      ? pairs.filter(p => favourites.has(p.pair))
      : pairs;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.displayName.toLowerCase().includes(q) || p.pair.toLowerCase().includes(q),
      );
    }
    return list;
  }, [pairs, query, activeTab, favourites]);

  const handlePress = useCallback(
    (pair: PairState) => navigation.navigate('MarketDetail', { pair: pair.pair }),
    [navigation],
  );

  const renderItem = useCallback(({ item }: { item: PairState }) => (
    <WatchlistRow
      pair={item}
      isFavourite={favourites.has(item.pair)}
      onPress={() => handlePress(item)}
      onToggleFav={() => toggleFav(item.pair)}
    />
  ), [favourites, handlePress, toggleFav]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Markets</Text>
          </View>
          <ConnectionBadge status={connectionStatus} />
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search pairs…"
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['all', 'favourites'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'all' ? 'All Pairs' : '★ Favourites'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Column headers ─────────────────────────────────────────────── */}
      <View style={styles.colRow}>
        <Text style={[styles.col, { flex: 2 }]}>PAIR</Text>
        <Text style={[styles.col, { textAlign: 'right', flex: 1.2 }]}>PRICE</Text>
        <Text style={[styles.col, { textAlign: 'center', minWidth: 74 }]}>24H</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* ── List ───────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.pair}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshMeta}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {activeTab === 'favourites'
                ? 'No favourites yet.\nTap ☆ on any pair to add one.'
                : 'No pairs match your search.'}
            </Text>
          </View>
        }
        contentContainerStyle={filtered.length === 0 ? styles.emptyFlex : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.bg1 },
  header:     {
    backgroundColor:  Colors.bg2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom:     Spacing.sm,
  },
  headerRow:  {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.md,
    paddingBottom:     Spacing.sm,
  },
  title:      { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.textPrimary },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  menuBtn:    { padding: 2 },
  menuIcon:   { fontSize: 20, color: Colors.textPrimary },
  searchWrap: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  Colors.bg1,
    marginHorizontal: Spacing.lg,
    marginBottom:     Spacing.sm,
    borderRadius:     Radius.md,
    paddingHorizontal: Spacing.md,
    borderWidth:      1,
    borderColor:      Colors.border,
    gap:              Spacing.sm,
  },
  searchIcon:  { fontSize: 18, color: Colors.textMuted },
  searchInput: { flex: 1, height: 40, color: Colors.textPrimary, fontSize: FontSize.base },
  clearBtn:    { color: Colors.textMuted, fontSize: FontSize.sm, padding: 4 },
  tabs:        {
    flexDirection:    'row',
    paddingHorizontal: Spacing.lg,
    gap:              Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.xs + 2,
    borderRadius:      Radius.full,
    backgroundColor:   Colors.bg1,
    borderWidth:       1,
    borderColor:       Colors.border,
  },
  tabActive:     { backgroundColor: Colors.accentDim, borderColor: Colors.accent },
  tabText:       { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: '500' },
  tabTextActive: { color: Colors.accent, fontWeight: '600' },
  colRow: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical:   Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    gap:              Spacing.sm,
  },
  col:     { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '600', letterSpacing: 0.5 },
  empty:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: {
    color:       Colors.textMuted,
    fontSize:    FontSize.base,
    textAlign:   'center',
    lineHeight:  22,
  },
  emptyFlex: { flex: 1 },
});
