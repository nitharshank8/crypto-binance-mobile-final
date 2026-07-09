import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer }          from '@react-navigation/native';
import { createDrawerNavigator }        from '@react-navigation/drawer';
import { createBottomTabNavigator }     from '@react-navigation/bottom-tabs';
import { createStackNavigator }         from '@react-navigation/stack';

import { MarketsScreen }       from '../screens/MarketsScreen';
import { MarketDetailScreen }  from '../screens/MarketDetailScreen';
import { TelemetryScreen }     from '../screens/TelemetryScreen';
import { AccountScreen }       from '../screens/AccountScreen';
import { DrawerContent }       from './DrawerContent';
import { Colors, FontSize }    from '../theme';

// ── Tab icon ──────────────────────────────────────────────────────────────────

function TabIcon({ label, icon, focused }: { label: string; icon: string; focused: boolean }) {
  return (
    <View style={ti.wrap}>
      <Text style={[ti.emoji, { opacity: focused ? 1 : 0.45 }]}>{icon}</Text>
      <Text style={[ti.label, { color: focused ? Colors.tabActive : Colors.tabInactive }]}>
        {label}
      </Text>
    </View>
  );
}
const ti = StyleSheet.create({
  wrap:  { alignItems: 'center', gap: 2 },
  emoji: { fontSize: 20 },
  label: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
});

// ── Market stack (list → detail) ──────────────────────────────────────────────

const MarketStack = createStackNavigator();

function MarketStackNav() {
  return (
    <MarketStack.Navigator screenOptions={{ headerShown: false }}>
      <MarketStack.Screen name="MarketsList"   component={MarketsScreen} />
      <MarketStack.Screen name="MarketDetail"  component={MarketDetailScreen as any} />
    </MarketStack.Navigator>
  );
}

// ── Bottom tab navigator ──────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg2,
          borderTopColor:  Colors.border,
          borderTopWidth:  1,
          height:          62,
          paddingBottom:   8,
          paddingTop:      6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Terminal"
        component={MarketStackNav}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon icon="📈" label="Terminal" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TelemetryTab"
        component={TelemetryScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon icon="⬡" label="Telemetry" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon icon="⚙" label="Settings" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ── Drawer (root) ─────────────────────────────────────────────────────────────

const Drawer = createDrawerNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={props => <DrawerContent {...props} />}
        screenOptions={{
          headerShown:   false,
          drawerStyle:   { backgroundColor: Colors.drawerBg, width: 260 },
          drawerType:    'slide',
          overlayColor:  'rgba(0,0,0,0.6)',
          swipeEdgeWidth: 40,
        }}
      >
        {/* Main app */}
        <Drawer.Screen name="Main"          component={BottomTabs} />
        {/* Accessible via drawer links */}
        <Drawer.Screen name="AccountDrawer" component={AccountScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
