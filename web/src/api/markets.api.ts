import { slugify } from '@/lib/slugify';
import fs, { readdirSync, readFileSync } from 'fs';
import path from 'path';

interface Market {
  ticker: string;
  description: string;
}

export const AGENT_DATA_PATH =
  '/Users/kubarogut/Documents/Projects/openai-hackathon/agent/data';

export const getMarkets = (): { title: string }[] => {
  // list all folders in the agent data path
  const folders = readdirSync(AGENT_DATA_PATH, { withFileTypes: true });

  return folders
    .filter((folder) => folder.isDirectory())
    .map((folder) => ({
      title: folder.name,
    }));
};

export interface Report {
  fileName: string;
  content: string;
}

const getMarketDirName = (market: string) => {
  const slug = slugify(market);
  return path.join(AGENT_DATA_PATH, slug);
};

export const getMarketDetails = (dirName: string): Market => {
  const slug = slugify(dirName);
  const marketDir = path.join(AGENT_DATA_PATH, slug);
  const description = readFileSync(
    path.join(marketDir, 'description.json'),
    'utf8'
  );

  const totalMarket = JSON.parse(description);

  const event = totalMarket.events[0];

  return {
    ticker: event.ticker,
    description: event.title,
  };
};

export const getReportsForMarket = (marketTitle: string): Report[] => {
  const reportsDir = path.join(getMarketDirName(marketTitle), 'reports');
  const reports = readdirSync(reportsDir, { withFileTypes: true });

  return reports
    .filter((report) => report.isFile() && report.name.endsWith('.md'))
    .map((report) => {
      const content = readFileSync(path.join(reportsDir, report.name), 'utf8');
      return {
        fileName: report.name,
        content,
      };
    });
};

export interface Probability {
  ticker: string;
  description: string;
  market_type: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  probability: {
    yesProbability: number;
    noProbability: number;
    reasoning: string;
  };
}

export const getProbabilitiesForMarket = (
  marketTitle: string
): Probability[] => {
  const probabilitiesDir = path.join(
    getMarketDirName(marketTitle),
    'probabilities'
  );
  const probabilities = readdirSync(probabilitiesDir, { withFileTypes: true });

  return probabilities.map((probability) => {
    const content = readFileSync(
      path.join(probabilitiesDir, probability.name),
      'utf8'
    );
    return JSON.parse(content);
  });
};

export interface DataAnalysis {
  fileName: string;
  content: string;
}

export const getDataAnalysisForMarket = (
  marketTitle: string
): DataAnalysis[] => {
  const analysisDir = path.join(getMarketDirName(marketTitle), 'data-analysis');
  const analysis = readdirSync(analysisDir, { withFileTypes: true });

  return analysis.map((analysis) => {
    const content = readFileSync(path.join(analysisDir, analysis.name), 'utf8');
    return {
      fileName: analysis.name,
      content,
    };
  });
};
