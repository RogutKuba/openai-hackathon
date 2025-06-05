import { Agent, run } from '@openai/agents';
import { KalshiMarket } from '../api/kalshi';
import { z } from 'zod';
import { analyzeLatestFREDData, getMarketDirName } from './analyst.agent';
import { webAnalystAgent } from './webAnalyst.agent';
import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';

const analysisTriageOutputType = z.object({
  analysisToDo: z
    .array(
      z.object({
        type: z
          .enum(['web', 'financial_data'])
          .describe(
            'The type of analysis to perform. "web" if the market is about recent news, policy, or events. "financial_data" if the market is about economic data (like CPI, jobs, GDP, etc)'
          ),
        query: z
          .string()
          .describe(
            'Describe the query to perform the analysis. For web analysis, describe what to search for. For financial data analysis, describe the type of economic indicator to investigate.'
          ),
      })
    )
    .describe('A list of analysis tasks to perform'),
});

const analysisTriageAgent = new Agent({
  name: 'Analysis Triage Agent',
  instructions: `
You are a market analysis coordinator. For each Kalshi market, identify and break down each topic that needs analysis into separate, independent analysis tasks.

Important rules:
- Each distinct topic or aspect of the market should be treated as a separate analysis task
- Never combine or group related topics together
- If a market has multiple aspects (e.g., both economic data and news events), create separate tasks for each
- Each task should be self-contained and focused on a single aspect

For each topic:
- If it's about economic data (like CPI, jobs, GDP, etc), create a 'financial_data' analysis task
- If it's about recent news, policy, or events, create a 'web' analysis task
- Provide a clear, specific query for each individual topic

Return a list of analysis tasks, where each task represents one independent topic to analyze.
  `,
  outputType: analysisTriageOutputType,
});

const quantAgent = new Agent({
  name: 'Quantitative Analysis Agent',
  instructions: `You are an expert in quantitative analysis and market prediction. You will be given a set of analysis reports and a specific market outcome to evaluate. Your task is to:

1. Carefully analyze all provided reports
2. Consider both supporting and opposing evidence
3. Weigh the reliability and relevance of each piece of information
4. Assign probabilities to the "yes" and "no" outcomes that sum to 100%

Important guidelines:
- Base your probabilities on concrete evidence from the reports
- Consider the strength and reliability of the data sources
- Account for both direct and indirect evidence
- Be conservative in your probability assignments
- Ensure your yes and no probabilities sum to 100%

The market outcome you need to evaluate will be provided in the context.`,
  tools: [],
  outputType: z.object({
    yesProbability: z
      .number()
      .min(0)
      .max(100)
      .describe(
        'The probability of the market outcome being "yes" (true), as a percentage'
      ),
    noProbability: z
      .number()
      .min(0)
      .max(100)
      .describe(
        'The probability of the market outcome being "no" (false), as a percentage'
      ),
    reasoning: z
      .string()
      .describe(
        'A detailed explanation of how you arrived at these probabilities'
      ),
  }),
});

const formatKalshiMarket = (event: KalshiMarket['events'][number]) => {
  return `You are analyzing the following Kalshi market: ticker: ${
    event.ticker
  }, title: ${event.title};

  The possible outcomes with their yes and no prices are:
  ${event.markets
    .map(
      (market) =>
        `${market.ticker} - Rules: ${market.description}. Yes: ${market.yes_bid}, No: ${market.no_bid}`
    )
    .join(',\n')}
  `;
};

export const analyzeKalshiMarket = async (market: KalshiMarket) => {
  const marketDirName = getMarketDirName(market.seriesTitle);
  const event = market.events[0];

  console.log('formatKalshiMarket', formatKalshiMarket(event));

  const toDoReports = await run(analysisTriageAgent, formatKalshiMarket(event));

  const reportsToCreate = toDoReports.finalOutput?.analysisToDo ?? [];

  console.log('reportsToCreate', reportsToCreate);

  const reports = await Promise.all(
    reportsToCreate.map(async (report) => {
      switch (report.type) {
        case 'web':
          const agentResult = await run(webAnalystAgent, report.query);
          return (
            agentResult.finalOutput ?? {
              report: 'There was an error with the web analysis',
              reportFileName: 'report-error',
            }
          );
        case 'financial_data':
          return analyzeLatestFREDData(report.query, marketDirName);
      }
    }) ?? []
  );

  const reportsDirName = path.join(marketDirName, 'reports');

  // ensure the reports directory exists
  mkdirSync(reportsDirName, { recursive: true });
  reports.forEach((report) => {
    writeFileSync(
      `${reportsDirName}/${report.reportFileName}.md`,
      report.report
    );
  });

  // run the quant agent with the reports as context for each market
  const marketProbabilities = await Promise.all(
    event.markets.map(async (market) => {
      const context = `
Market to evaluate:
${market.ticker} - Rules: ${market.description}

Analysis Reports:
${reports.join('\n\n')}

Based on these reports, please evaluate the probability of this market outcome.
`;

      const outcomeResult = await run(quantAgent, context);

      return {
        ...market,
        probability: outcomeResult.finalOutput ?? null,
      };
    })
  );

  const probabilitiesDirName = path.join(marketDirName, 'probabilities');
  mkdirSync(probabilitiesDirName, { recursive: true });
  marketProbabilities.forEach((market) => {
    writeFileSync(
      `${probabilitiesDirName}/${market.ticker}.json`,
      JSON.stringify(market, null, 2)
    );
  });
};
