import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mockSocket } from '../services/mockSocket';
import { executeOrder } from '../services/tradeApi';
import { SymbolTick, RootStackParamList } from '../types/trading';
import { COLORS } from '../common/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'SymbolDetails'>;

export const SymbolDetailsScreen: React.FC<Props> = ({ route }) => {
  const { symbol, initialTick } = route.params;
  const [currentTick, setCurrentTick] = useState<SymbolTick>(initialTick);
  const [quantity, setQuantity] = useState<string>('10');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = mockSocket.subscribe(ticks => {
      const updated = ticks.find(t => t.symbol === symbol);
      if (updated) setCurrentTick(updated);
    });
    return () => unsubscribe();
  }, [symbol]);

  const handleTrade = async (side: 'BUY' | 'SELL') => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid quantity.');
      return;
    }

    setLoading(true);
    const executionPrice = side === 'BUY' ? currentTick.ask : currentTick.bid;
    const res = await executeOrder({ symbol, side, quantity: qty, price: executionPrice });
    setLoading(false);

    if (res.success) {
      Alert.alert('Trade Successful', res.message);
    } else {
      Alert.alert('Trade Failed', res.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.symbolHeader}>{currentTick.symbol}</Text>
      <Text style={styles.nameSubheader}>{currentTick.name}</Text>

      <View style={styles.tickerCard}>
        <View style={styles.priceBox}>
          <Text style={styles.priceHeading}>BID</Text>
          <Text style={[styles.priceValue, { color: COLORS.danger }]}>{currentTick.bid}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceBox}>
          <Text style={styles.priceHeading}>ASK</Text>
          <Text style={[styles.priceValue, { color: COLORS.success }]}>{currentTick.ask}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.accent} style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.tradeButton, styles.sellBtn]} onPress={() => handleTrade('SELL')}>
            <Text style={styles.btnText}>SELL @ {currentTick.bid}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tradeButton, styles.buyBtn]} onPress={() => handleTrade('BUY')}>
            <Text style={styles.btnText}>BUY @ {currentTick.ask}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  symbolHeader: { color: COLORS.textPrimary, fontSize: 28, fontWeight: 'bold' },
  nameSubheader: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 20 },
  tickerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 24,
  },
  priceBox: { alignItems: 'center' },
  priceHeading: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 4 },
  priceValue: { fontSize: 24, fontWeight: 'bold' },
  divider: { width: 1, height: '80%', backgroundColor: COLORS.border },
  inputContainer: { marginBottom: 24 },
  label: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  tradeButton: { flex: 1, paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  sellBtn: { backgroundColor: COLORS.danger },
  buyBtn: { backgroundColor: COLORS.success },
  btnText: { color: COLORS.textInverse, fontWeight: 'bold', fontSize: 14 },
});