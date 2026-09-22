import { executeOrder } from './tradeApi';

describe('executeOrder', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('executes an order within the margin limit', async () => {
    const resultPromise = executeOrder({ symbol: 'EUR/USD', side: 'BUY', quantity: 10, price: 1.0844 });
    jest.advanceTimersByTime(500);

    await expect(resultPromise).resolves.toEqual({
      success: true,
      message: 'Order Executed! BUY 10 EUR/USD @ 1.0844',
    });
  });

  it('rejects an order over the margin limit', async () => {
    const resultPromise = executeOrder({ symbol: 'EUR/USD', side: 'SELL', quantity: 101, price: 1.08425 });
    jest.advanceTimersByTime(500);

    await expect(resultPromise).resolves.toEqual({
      success: false,
      message: 'Exceeds maximum allowed margin per trade.',
    });
  });
});
