import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { SymbolDetailsScreen } from './SymbolDetailsScreen';
import { mockSocket } from '../services/mockSocket';
import { executeOrder } from '../services/tradeApi';
import { SymbolTick } from '../types/trading';

jest.mock('../services/mockSocket', () => ({
  mockSocket: {
    subscribe: jest.fn(),
  },
}));

jest.mock('../services/tradeApi', () => ({
  executeOrder: jest.fn(),
}));

const initialTick: SymbolTick = {
  symbol: 'EUR/USD',
  name: 'Euro / US Dollar',
  bid: 1.08425,
  ask: 1.0844,
  digits: 5,
  direction: 'neutral',
};

describe('SymbolDetailsScreen', () => {
  const unsubscribe = jest.fn();
  let listener: (ticks: SymbolTick[]) => void;
  const route = { params: { symbol: 'EUR/USD', initialTick } } as never;
  const navigation = {} as never;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockSocket.subscribe as jest.Mock).mockImplementation((callback: (ticks: SymbolTick[]) => void) => {
      listener = callback;
      return unsubscribe;
    });
    (executeOrder as jest.Mock).mockResolvedValue({ success: true, message: 'Trade complete' });
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders live prices and responds to socket updates', async () => {
    const result = await render(<SymbolDetailsScreen navigation={navigation} route={route} />);
    const updatedTick = { ...initialTick, bid: 1.0843, ask: 1.08445 };

    expect(result.getByText('1.08425')).toBeTruthy();
    await act(() => listener([updatedTick]));
    expect(result.getByText('1.0843')).toBeTruthy();
    expect(result.getByText('1.08445')).toBeTruthy();

    await result.unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });

  it('keeps the current prices when an update has no matching symbol', async () => {
    const result = await render(<SymbolDetailsScreen navigation={navigation} route={route} />);

    await act(() => listener([]));
    expect(result.getByText('1.08425')).toBeTruthy();
    expect(result.getByText('1.0844')).toBeTruthy();
  });

  it('shows a validation alert for invalid quantities', async () => {
    const result = await render(<SymbolDetailsScreen navigation={navigation} route={route} />);

    await fireEvent.changeText(result.getByDisplayValue('10'), 'not-a-number');
    await fireEvent.press(result.getByText('BUY @ 1.0844'));

    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('Invalid Quantity', 'Please enter a valid quantity.'));
    expect(executeOrder).not.toHaveBeenCalled();
  });

  it('executes a buy order and shows success', async () => {
    const result = await render(<SymbolDetailsScreen navigation={navigation} route={route} />);

    await fireEvent.press(result.getByText('BUY @ 1.0844'));

    await waitFor(() => {
      expect(executeOrder).toHaveBeenCalledWith({ symbol: 'EUR/USD', side: 'BUY', quantity: 10, price: 1.0844 });
      expect(Alert.alert).toHaveBeenCalledWith('Trade Successful', 'Trade complete');
    });
  });

  it('shows a loading indicator while an order is being executed', async () => {
    let resolveOrder: (value: { success: boolean; message: string }) => void = () => undefined;
    (executeOrder as jest.Mock).mockReturnValue(new Promise(resolve => {
      resolveOrder = resolve;
    }));
    const result = await render(<SymbolDetailsScreen navigation={navigation} route={route} />);

    const pressPromise = fireEvent.press(result.getByText('BUY @ 1.0844'));
    await waitFor(() => expect(JSON.stringify(result.toJSON())).toContain('ActivityIndicator'));
    resolveOrder({ success: true, message: 'Trade complete' });
    await pressPromise;
  });

  it('executes a sell order and shows failure', async () => {
    (executeOrder as jest.Mock).mockResolvedValue({ success: false, message: 'Rejected' });
    const result = await render(<SymbolDetailsScreen navigation={navigation} route={route} />);

    await fireEvent.press(result.getByText('SELL @ 1.08425'));

    await waitFor(() => {
      expect(executeOrder).toHaveBeenCalledWith({ symbol: 'EUR/USD', side: 'SELL', quantity: 10, price: 1.08425 });
      expect(Alert.alert).toHaveBeenCalledWith('Trade Failed', 'Rejected');
    });
  });
});
