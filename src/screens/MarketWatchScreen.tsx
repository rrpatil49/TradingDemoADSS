import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { mockSocket } from '../services/mockSocket';
import { SymbolTick, RootStackParamList } from '../types/trading';
import { COLORS } from '../common/colors';
import { formatPrice } from '../common/helper';

type Props = NativeStackScreenProps<RootStackParamList, 'MarketWatch'>;

const SymbolRow = React.memo(({ item, onPress }: { item: SymbolTick; onPress: () => void }) => {
  const flashColor = item.direction === 'up' ? COLORS.success : item.direction === 'down' ? COLORS.danger : COLORS.neutral;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View>
        <Text style={styles.symbolText}>{item.symbol}</Text>
        <Text style={styles.nameText}>{item.name}</Text>
      </View>
      <View style={styles.priceContainer}>
        <View style={[styles.priceBadge, { flexDirection: 'column', alignItems: 'center' }]}>
          <Text style={[styles.priceBadge, { backgroundColor: flashColor }]}>{formatPrice(item.bid, item.digits)}</Text>
          <Text style={styles.priceLabel}>bid</Text>
        </View>
        <View style={[styles.priceBadge, { flexDirection: 'column', alignItems: 'center' }]}>
          <Text style={[styles.priceBadge, { backgroundColor: flashColor }]}>{formatPrice(item.ask, item.digits)}</Text>
          <Text style={styles.priceLabel}>ask</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export const MarketWatchScreen: React.FC<Props> = ({ navigation }) => {
  const [ticks, setTicks] = useState<SymbolTick[]>([]);

  const renderItem = ({ item }: { item: SymbolTick }) => (
    <SymbolRow
      item={item}
      onPress={() => navigation.navigate('SymbolDetails', { symbol: item.symbol, initialTick: item })}
    />
  );

  useEffect(() => {
    mockSocket.start();
    const unsubscribe = mockSocket.subscribe(setTicks);
    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={ticks}
        keyExtractor={item => item.symbol}
        renderItem={renderItem}
        initialNumToRender={15}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 12, paddingTop: 10 },
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symbolText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  nameText: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  priceContainer: { flexDirection: 'row', gap: 8 },
  priceBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 4 },
  priceLabel: { color: COLORS.textInverse, fontSize: 12, fontWeight: '600' },
});