import dotenv from 'dotenv';
import { getLatestEconomicsMarkets } from './api/kalshi';
import { analyzeKalshiMarket } from './agents/trader.agent';
import { mkdirSync, writeFileSync } from 'fs';
import { getMarketDirName } from './agents/analyst.agent';
import path from 'path';

dotenv.config();

async function main() {
  console.log('Starting!');
  const markets = await getLatestEconomicsMarkets();
  console.log('got-markets', markets.length);

  for (const market of markets.slice(0, 1)) {
    const marketDirName = getMarketDirName(market.seriesTitle);

    // make all the directories
    mkdirSync(marketDirName, { recursive: true });
    mkdirSync(path.join(marketDirName, 'data-analysis'), { recursive: true });
    mkdirSync(path.join(marketDirName, 'probabilities'), { recursive: true });
    mkdirSync(path.join(marketDirName, 'reports'), { recursive: true });

    // write file description
    const descriptionFile = path.join(marketDirName, 'description.json');
    writeFileSync(descriptionFile, JSON.stringify(market, null, 2));

    console.log(`Analyzing market: ${market.seriesTitle}`);
    await analyzeKalshiMarket(market);
  }
}

main()
  .then(() => {
    console.log('Agents finished!');
  })
  .catch((error) => {
    console.error('Error in main execution:', error);
    process.exit(1);
  });
