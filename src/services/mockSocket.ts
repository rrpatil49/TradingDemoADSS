// src/services/mockSocket.ts
import { SymbolTick } from '../types/trading';

class MockSocketServer {
  private listeners: Set<(ticks: SymbolTick[]) => void> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private ticks: SymbolTick[] = [
      // Forex Pairs
      { symbol: 'EUR/USD', name: 'Euro / US Dollar', bid: 1.08425, ask: 1.08440, digits: 5, direction: 'neutral' },
    { symbol: 'GBP/USD', name: 'British Pound / USD', bid: 1.26500, ask: 1.26530, digits: 5, direction: 'neutral' },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', bid: 154.200, ask: 154.230, digits: 3, direction: 'neutral' },
    { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', bid: 0.89850, ask: 0.89880, digits: 5, direction: 'neutral' },
    { symbol: 'AUD/USD', name: 'Australian Dollar / USD', bid: 0.65400, ask: 0.65430, digits: 5, direction: 'neutral' },
    { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', bid: 1.36800, ask: 1.36830, digits: 5, direction: 'neutral' },

    // Cryptocurrencies
    { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', bid: 64200.50, ask: 64205.00, digits: 2, direction: 'neutral' },
    { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', bid: 3450.75, ask: 3452.00, digits: 2, direction: 'neutral' },
    { symbol: 'SOL/USD', name: 'Solana / US Dollar', bid: 142.30, ask: 142.50, digits: 2, direction: 'neutral' },
    { symbol: 'XRP/USD', name: 'Ripple / US Dollar', bid: 0.5240, ask: 0.5245, digits: 4, direction: 'neutral' },

    // US Equities (Standard 2 decimals)
    { symbol: 'AAPL', name: 'Apple Inc.', bid: 182.50, ask: 182.55, digits: 2, direction: 'neutral' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', bid: 124.80, ask: 124.85, digits: 2, direction: 'neutral' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', bid: 448.20, ask: 448.30, digits: 2, direction: 'neutral' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', bid: 185.10, ask: 185.18, digits: 2, direction: 'neutral' },
    { symbol: 'TSLA', name: 'Tesla Inc.', bid: 218.40, ask: 218.50, digits: 2, direction: 'neutral' },

    // Indices
    { symbol: 'US500', name: 'S&P 500 Index', bid: 5460.20, ask: 5461.00, digits: 2, direction: 'neutral' },
    { symbol: 'US100', name: 'Nasdaq 100 Index', bid: 19720.50, ask: 19722.00, digits: 2, direction: 'neutral' },

    // Commodities
    { symbol: 'XAU/USD', name: 'Gold / US Dollar', bid: 2320.40, ask: 2320.90, digits: 2, direction: 'neutral' },
    { symbol: 'XAG/USD', name: 'Silver / US Dollar', bid: 29.500, ask: 29.540, digits: 3, direction: 'neutral' },
    { symbol: 'WTI/USD', name: 'Crude Oil WTI', bid: 80.60, ask: 80.65, digits: 2, direction: 'neutral' },
  ];

  public start() {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => {
      this.ticks = this.ticks.map(item => {
      const delta = (Math.random() - 0.49) * (item.bid * 0.0008);
      const rawBid = item.bid + delta;
      const spread = item.ask - item.bid;

      // Use digits to dynamically fix decimal places
      const newBid = Number(rawBid.toFixed(item.digits));
      const newAsk = Number((newBid + spread).toFixed(item.digits));

      return {
        ...item,
        bid: newBid,
        ask: newAsk,
        direction: newBid >= item.bid ? 'up' : 'down',
      };
    });

      this.listeners.forEach(listener => listener([...this.ticks]));
    }, 600);
  }

  public subscribe(callback: (ticks: SymbolTick[]) => void) {
    this.listeners.add(callback);
    callback(this.ticks);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const mockSocket = new MockSocketServer();