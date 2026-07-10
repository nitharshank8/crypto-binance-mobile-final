import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer }          from '@react-navigation/native';
import { createDrawerNavigator }        from '@react-navigation/drawer';
import { createBottomTabNavigator }     from '@react-navigation/bottom-tabs';
import { createStackNavigator }         from '@react-navigation/stack';
import { Ionicons }                     from '@expo/vector-icons';

import { MarketsScreen }       from '../screens/MarketsScreen';
import { MarketDetailScreen }  from '../screens/MarketDetailScreen';
import { TelemetryScreen }     from '../screens/TelemetryScreen';
import { AccountScreen }       from '../screens/AccountScreen';
import { DrawerContent }       from './DrawerContent';
import { Colors, FontSize }    from '../theme';

// ── Tab icon ──────────────────────────────────────────────────────────────────

function TabIcon({
  label,
  icon,
  focused,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
}) {
  return (
    <View style={ti.wrap}>
      <Ionicons
        name={icon}
        size={20}
        color={focused ? Colors.tabActive : '#FFFFFF'}
      />
      <Text style={[ti.label, { color: focused ? Colors.tabActive : '#FFFFFF' }]}>
        {label}
      </Text>
    </View>
  );
}
const ti = StyleSheet.create({
  wrap:  { alignItems: 'center', gap: 2, width: 76 },
  label: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3, flexShrink: 0 },
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

// ── Terminal stack (opens straight into DOGE/USDT detail) ─────────────────────

const TerminalStack = createStackNavigator();

function TerminalStackNav() {
  return (
    <TerminalStack.Navigator screenOptions={{ headerShown: false }}>
      <TerminalStack.Screen
        name="MarketDetail"
        component={MarketDetailScreen as any}
        initialParams={{ pair: 'BTCUSDT' }}
      />
    </TerminalStack.Navigator>
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
        component={TerminalStackNav}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon icon={focused ? 'trending-up' : 'trending-up-outline'} label="Terminal" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MarketsTab"
        component={MarketStackNav}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon icon={focused ? 'list' : 'list-outline'} label="Markets" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TelemetryTab"
        component={TelemetryScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon icon={focused ? 'pulse' : 'pulse-outline'} label="Telemetry" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) =>
            <TabIcon icon={focused ? 'settings' : 'settings-outline'} label="Settings" focused={focused} />,
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
