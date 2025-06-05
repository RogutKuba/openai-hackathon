import { loadPrivateKeyFromFile, signPssText } from '../lib/keys';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({
  path: '.env',
});

// Kalshi API Configuration
const KALSHI_API_BASE = 'https://demo-api.kalshi.co/trade-api/v2';
const KALSHI_API_KEY_ID = process.env.KALSHI_API_KEY_ID;
const KALSHI_PRIV_KEY_PATH = process.env.KALSHI_PRIV_KEY_PATH;

if (!KALSHI_API_KEY_ID || !KALSHI_PRIV_KEY_PATH) {
  throw new Error('KALSHI_API_KEY_ID and KALSHI_PRIV_KEY_PATH must be set');
}

export class Kalshi {
  apiKeyId: string;
  privateKey: crypto.KeyObject;
  lastApiCall: number;

  constructor() {
    this.apiKeyId = KALSHI_API_KEY_ID!;
    this.privateKey = loadPrivateKeyFromFile(KALSHI_PRIV_KEY_PATH!);
    this.lastApiCall = new Date().getTime();
  }

  async getBalance() {
    const response = await fetch(`${KALSHI_API_BASE}/portfolio/balance`, {
      method: 'GET',
      headers: this.requestHeaders('GET', '/portfolio/balance'),
    });

    const data = await response.json();
    return data;
  }

  async placeOrder(orderData: {
    action: string;
    client_order_id: string;
    count: number;
    side: string;
    ticker: string;
    type: string;
    yes_price: number;
  }) {
    const path = '/portfolio/orders';
    const headers = this.requestHeaders('POST', path);

    const response = await fetch(`${KALSHI_API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    console.log('Order response:', data);
    return data;
  }

  requestHeaders(method: string, rawPath: string): Record<string, string> {
    const path = `/trade-api/v2${rawPath}`;
    const current_time_milliseconds = Date.now();
    const timestampStr = current_time_milliseconds.toString();

    // Remove query params from path for signing (keep only the path part)
    const pathParts = path.split('?');
    const cleanPath = pathParts[0];

    // Message string should be: timestamp + method + path (no body included)
    const msgString = `${timestampStr}${method}${cleanPath}`;
    const signature = signPssText(this.privateKey, msgString);

    return {
      'Content-Type': 'application/json',
      'KALSHI-ACCESS-KEY': this.apiKeyId,
      'KALSHI-ACCESS-SIGNATURE': signature,
      'KALSHI-ACCESS-TIMESTAMP': timestampStr,
    };
  }

  async getMilestones() {
    const response = await fetch(
      `${KALSHI_API_BASE}/milestones/?category=financial&limit=100`,
      {
        method: 'GET',
        headers: this.requestHeaders(
          'GET',
          '/milestones/?category=economics&limit=100'
        ),
      }
    );

    const data = await response.json();
    return data;
  }

  async getEconomicsSeries() {
    const response = await fetch(
      `${KALSHI_API_BASE}/series/?category=Economics`,
      {
        method: 'GET',
        headers: this.requestHeaders('GET', '/series/?category=Economics'),
      }
    );

    const data = (await response.json()) as {
      series: {
        ticker: string;
        frequency: string;
        title: string;
        category: string;
        tags: string[];
      }[];
    };
    return data.series;
  }

  async getMarketsForSeries(seriesTicker: string) {
    const response = await fetch(
      `${KALSHI_API_BASE}/events/?series_ticker=${seriesTicker}&with_nested_markets=true`,
      {
        method: 'GET',
        headers: this.requestHeaders(
          'GET',
          `/events/?series_ticker=${seriesTicker}&with_nested_markets=true`
        ),
      }
    );

    const data = await response.json();
    return data;
  }
  // async getMarkets() {
  //   const response = await fetch(`${KALSHI_API_BASE}/markets`, {
  //     method: 'GET',
  //     headers: this.requestHeaders('GET', '/markets'),
  //   });

  //   const data = await response.json();
  //   console.log(data);
  //   return data;
  // }
}

export interface KalshiMarket {
  seriesTicker: string;
  seriesTitle: string;
  events: {
    ticker: string;
    title: string;
    markets: {
      ticker: string;
      description: string;
      market_type: string;
      yes_bid: number;
      yes_ask: number;
      no_bid: number;
      no_ask: number;
    }[];
  }[];
}

export const getLatestEconomicsMarkets = async () => {
  const kalshi = new Kalshi();
  const economicsSeries = await kalshi.getEconomicsSeries();

  const results: KalshiMarket[] = [];

  for (const series of economicsSeries.slice(0, 1)) {
    const eventsData = await kalshi.getMarketsForSeries(series.ticker);
    // results.push({
    //   seriesTicker: series.ticker,
    //   markets: markets,
    // });

    const events = eventsData.events.map((event) => {
      return {
        ticker: event.event_ticker,
        title: event.title,
        markets: event.markets.map((market) => {
          return {
            ticker: market.ticker,
            description: market.rules_primary,
            market_type: market.market_type,
            yes_bid: market.yes_bid,
            yes_ask: market.yes_ask,
            no_bid: market.no_bid,
            no_ask: market.no_ask,
          };
        }),
      };
    });

    results.push({
      seriesTicker: series.ticker,
      seriesTitle: series.title,
      events: events,
    });
  }

  return results;
};
