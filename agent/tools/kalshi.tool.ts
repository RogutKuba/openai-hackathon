import { tool } from '@openai/agents';
import { z } from 'zod';
import { Kalshi } from '../api/kalshi';

export const checkKalshiBalance = tool({
  name: 'check-kalshi-balance',
  description: 'Check the balance of your Kalshi account',
  parameters: z.object({}),
  execute: async () => {
    const kalshi = new Kalshi();
    const balance = await kalshi.getBalance();
    return balance;
  },
});
