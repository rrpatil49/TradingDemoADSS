export interface SymbolTick {
  symbol: string;
  name: string;
  bid: number;
  ask: number;
  digits: number;
  direction: 'up' | 'down' | 'neutral';
  bidDirection?: 'up' | 'down' | 'neutral';
  askDirection?: 'up' | 'down' | 'neutral';
}

export type RootStackParamList = {
  MarketWatch: undefined;
  SymbolDetails: { symbol: string; initialTick: SymbolTick };
};