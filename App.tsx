import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MarketWatchScreen } from './src/screens/MarketWatchScreen';
import { SymbolDetailsScreen } from './src/screens/SymbolDetailsScreen';
import { RootStackParamList } from './src/types/trading'
import { COLORS } from './src/common/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen name="MarketWatch" component={MarketWatchScreen} options={{ title: 'Market Watch' }} />
        <Stack.Screen name="SymbolDetails" component={SymbolDetailsScreen} options={{ title: 'Order Execution' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}