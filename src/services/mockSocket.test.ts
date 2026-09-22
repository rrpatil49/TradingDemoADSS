import { mockSocket } from './mockSocket';

describe('mockSocket', () => {
  afterEach(() => {
    mockSocket.stop();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('subscribes immediately and publishes changing ticks', () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0.6);
    const listener = jest.fn();
    const unsubscribe = mockSocket.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0][0]).toMatchObject({
      symbol: 'EUR/USD',
      direction: 'neutral',
    });

    mockSocket.start();
    mockSocket.start();
    jest.advanceTimersByTime(600);

    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[1][0][0].direction).toBe('up');

    unsubscribe();
    jest.advanceTimersByTime(600);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('stops publishing updates', () => {
    jest.useFakeTimers();
    const listener = jest.fn();
    mockSocket.subscribe(listener);
    mockSocket.start();
    mockSocket.stop();
    jest.advanceTimersByTime(600);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('marks a tick as down when its updated bid decreases', () => {
    jest.useFakeTimers();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const listener = jest.fn();
    mockSocket.subscribe(listener);
    mockSocket.start();
    jest.advanceTimersByTime(600);

    expect(listener.mock.calls.at(-1)?.[0][0].direction).toBe('down');
  });
});
