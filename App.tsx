// gesture-handler MUST be the very first import
import 'react-native-gesture-handler';

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider }       from 'react-native-safe-area-context';
import { StatusBar }              from 'expo-status-bar';

import { MarketProvider } from './src/context/MarketContext';
import { RootNavigator }  from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <MarketProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </MarketProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
