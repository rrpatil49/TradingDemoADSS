// src/services/tradeApi.ts
export interface TradeRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
}

export const executeOrder = async (req: TradeRequest): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency

  // Mock failure trigger for testing/demo purposes
  if (req.quantity > 100) {
    return { success: false, message: 'Exceeds maximum allowed margin per trade.' };
  }

  return {
    success: true,
    message: `Order Executed! ${req.side} ${req.quantity} ${req.symbol} @ ${req.price}`,
  };
};