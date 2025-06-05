import { Agent } from '@openai/agents';
import { z } from 'zod';
import { KalshiMarket } from '../api/kalshi';

const positionSizerAgent = new Agent({
  name: 'Position Sizer',
  instructions:
    'You are a position sizer. You are given a list of trades to execute.',
  tools: [],
  outputType: z.object({
    positionSize: z.number().describe('The size of the position to take'),
  }),
});

export const executorAgent = new Agent({
  name: 'Trade Executor',
  instructions:
    'You are a trade executor. You are given a list of trades to execute.',
  tools: [],
  outputType: z.object({}),
});

// export const executeTradeForMarket = async (market: KalshiMarket) => {
//   const agent = new Agent({
//     name: 'Trade Executor',
//     instructions: 'You are a trade executor. You are given a list of trades to execute.',
//     tools: [],
//     outputType: z.object({}),
//   });
