import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MarketWatchScreen } from './MarketWatchScreen';
import { mockSocket } from '../services/mockSocket';
import { SymbolTick } from '../types/trading';
import { COLORS } from '../common/colors';

jest.mock('../services/mockSocket', () => ({
  mockSocket: {
    start: jest.fn(),
    subscribe: jest.fn(),
  },
}));

const ticks: SymbolTick[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', bid: 1.08425, ask: 1.0844, digits: 5, direction: 'up', bidDirection: 'up', askDirection: 'down' },
  { symbol: 'GBP/USD', name: 'British Pound / USD', bid: 1.265, ask: 1.2653, digits: 5, direction: 'down' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', bid: 154.2, ask: 154.23, digits: 3, direction: 'neutral', bidDirection: 'neutral', askDirection: 'up' },
];

describe('MarketWatchScreen', () => {
  const navigation = { navigate: jest.fn() };
  const route = {} as never;
  const unsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (mockSocket.subscribe as jest.Mock).mockImplementation((callback: (value: SymbolTick[]) => void) => {
      callback(ticks);
      return unsubscribe;
    });
  });

  it('renders formatted quotes and navigates to symbol details', async () => {
    const { unmount } = await render(<MarketWatchScreen navigation={navigation as never} route={route} />);

    expect(mockSocket.start).toHaveBeenCalledTimes(1);
    expect(screen.getByText('1.08425')).toBeTruthy();
    expect(screen.getByText('1.26500')).toBeTruthy();
    expect(screen.getByText('154.230')).toBeTruthy();
    expect(screen.getByText('1.08425').props.style).toEqual(expect.arrayContaining([expect.objectContaining({ backgroundColor: COLORS.success })]));
    expect(screen.getByText('1.08440').props.style).toEqual(expect.arrayContaining([expect.objectContaining({ backgroundColor: COLORS.danger })]));

    await fireEvent.press(screen.getByText('EUR/USD'));
    expect(navigation.navigate).toHaveBeenCalledWith('SymbolDetails', {
      symbol: 'EUR/USD',
      initialTick: ticks[0],
    });

    await unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
